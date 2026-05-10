<?php
/**
 * preDoctr MCQ Exporter v2
 * ─────────────────────────────────────────────────────────
 * Exports MCQs directly from the WordPress MySQL database as JSON.
 * Downloads in pages to handle large datasets safely.
 *
 * USAGE:
 *   1. Upload to WordPress root: lms.predoctr.pk/predoctr_export.php
 *   2. Discover:  ?key=predoctr2024
 *   3. Export p1: ?key=predoctr2024&mode=export&page=0
 *   4. Export p2: ?key=predoctr2024&mode=export&page=1
 *   ... repeat until total_questions < per_page
 *   5. DELETE this file immediately after!
 * ─────────────────────────────────────────────────────────
 */

define('EXPORT_KEY', 'predoctr2024');
define('PER_PAGE', 2000);   // questions per page

if (!isset($_GET['key']) || $_GET['key'] !== EXPORT_KEY) {
    http_response_code(403);
    die(json_encode(['error' => 'Access denied. Add ?key=predoctr2024']));
}

// ── Load WP DB credentials ───────────────────────────────
$config = file_get_contents(__DIR__ . '/wp-config.php');

function wpConst($cfg, $name) {
    preg_match("/define\(\s*['\"]" . $name . "['\"]\s*,\s*['\"](.*?)['\"]\s*\)/s", $cfg, $m);
    return $m[1] ?? '';
}

$db_name = wpConst($config, 'DB_NAME');
$db_user = wpConst($config, 'DB_USER');
$db_pass = wpConst($config, 'DB_PASSWORD');
$db_host = wpConst($config, 'DB_HOST');

preg_match('/\$table_prefix\s*=\s*[\'"]([^\'"]+)[\'"]/', $config, $pm);
$prefix = $pm[1] ?? 'wp_';

$pdo = new PDO("mysql:host={$db_host};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$qt = $prefix . 'aysquiz_questions';
$at = $prefix . 'aysquiz_answers';
$ct = $prefix . 'aysquiz_categories';

$mode = $_GET['mode'] ?? 'discover';

// ── DISCOVER ─────────────────────────────────────────────
if ($mode === 'discover') {
    $total_q    = $pdo->query("SELECT COUNT(*) FROM `{$qt}`")->fetchColumn();
    $total_a    = $pdo->query("SELECT COUNT(*) FROM `{$at}`")->fetchColumn();
    $total_c    = $pdo->query("SELECT COUNT(*) FROM `{$ct}`")->fetchColumn();
    $pub_counts = $pdo->query("SELECT published, COUNT(*) as cnt FROM `{$qt}` GROUP BY published")->fetchAll();
    $type_counts= $pdo->query("SELECT type, COUNT(*) as cnt FROM `{$qt}` GROUP BY type ORDER BY cnt DESC")->fetchAll();
    $pages_needed = ceil($total_q / PER_PAGE);

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'prefix'         => $prefix,
        'total_questions'=> (int)$total_q,
        'total_answers'  => (int)$total_a,
        'total_categories'=> (int)$total_c,
        'per_page'       => PER_PAGE,
        'pages_needed'   => $pages_needed,
        'published_breakdown' => $pub_counts,
        'type_breakdown' => $type_counts,
        'export_urls'    => array_map(fn($p) =>
            "?key=predoctr2024&mode=export&page={$p}",
            range(0, $pages_needed - 1)
        ),
    ], JSON_PRETTY_PRINT);
    exit;
}

// ── EXPORT categories (one-time, small) ──────────────────
if ($mode === 'categories') {
    $cats = $pdo->query("SELECT id, title, parent_id FROM `{$ct}` ORDER BY id")->fetchAll();
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename="predoctr_categories.json"');
    echo json_encode(['categories' => $cats], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// ── EXPORT questions page by page ────────────────────────
if ($mode === 'export') {
    $page   = max(0, (int)($_GET['page'] ?? 0));
    $offset = $page * PER_PAGE;

    // Fetch questions for this page
    $stmt = $pdo->prepare(
        "SELECT id, category_id, question, explanation, type, published, create_date
         FROM `{$qt}`
         ORDER BY id
         LIMIT :lim OFFSET :off"
    );
    $stmt->bindValue(':lim', PER_PAGE, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset,  PDO::PARAM_INT);
    $stmt->execute();
    $questions = $stmt->fetchAll();

    if (empty($questions)) {
        header('Content-Type: application/json');
        echo json_encode(['page' => $page, 'total_questions' => 0, 'questions' => []]);
        exit;
    }

    // Get question IDs for this page
    $ids = array_column($questions, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    // Fetch all answers for this page's questions in one query
    $aStmt = $pdo->prepare(
        "SELECT question_id, answer, correct, ordering
         FROM `{$at}`
         WHERE question_id IN ({$placeholders})
         ORDER BY question_id, ordering"
    );
    $aStmt->execute($ids);
    $allAnswers = $aStmt->fetchAll();

    // Group answers by question_id
    $answerMap = [];
    foreach ($allAnswers as $a) {
        $answerMap[$a['question_id']][] = [
            'answer'  => $a['answer'],
            'correct' => (int)$a['correct'],
            'order'   => (int)$a['ordering'],
        ];
    }

    // Build output
    $output = [];
    foreach ($questions as $q) {
        $answers = $answerMap[$q['id']] ?? [];
        usort($answers, fn($a, $b) => $a['order'] - $b['order']);
        $output[] = [
            'id'          => (int)$q['id'],
            'category_id' => (int)$q['category_id'],
            'question'    => $q['question'],
            'explanation' => $q['explanation'],
            'type'        => $q['type'],
            'published'   => (int)$q['published'],
            'answers'     => $answers,
        ];
    }

    $filename = "predoctr_mcqs_page{$page}.json";
    header('Content-Type: application/json; charset=utf-8');
    header("Content-Disposition: attachment; filename=\"{$filename}\"");
    echo json_encode([
        'page'            => $page,
        'per_page'        => PER_PAGE,
        'total_questions' => count($output),
        'questions'       => $output,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

die(json_encode(['error' => 'Unknown mode']));
