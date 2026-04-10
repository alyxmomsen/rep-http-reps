const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Сборка React приложения...');

try {
    // Сохраняем путь к корню проекта
    const PROJECT_ROOT = __dirname;

    // Переходим в папку client и запускаем сборку
    process.chdir('./client');
    console.log('📦 Установка зависимостей...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('🔨 Сборка React...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('✅ React приложение собрано!');

    // Возвращаемся в корень проекта
    process.chdir(PROJECT_ROOT);

    // Пути
    const buildPath = path.join(PROJECT_ROOT, 'client', 'build');
    const targetPath = path.join(PROJECT_ROOT, 'public');

    console.log(`📂 buildPath: ${buildPath}`);
    console.log(`📂 targetPath: ${targetPath}`);

    // Проверяем, что buildPath существует
    if (!fs.existsSync(buildPath)) {
        throw new Error(`Build path not found: ${buildPath}`);
    }

    // Копируем статику React
    const reactStaticPath = path.join(buildPath, 'static');
    const targetStaticPath = path.join(targetPath, 'static');

    console.log(`📦 Копирование статики:`);
    console.log(`   из: ${reactStaticPath}`);
    console.log(`   в: ${targetStaticPath}`);

    if (fs.existsSync(reactStaticPath)) {
        // Удаляем старую статику если есть
        if (fs.existsSync(targetStaticPath)) {
            fs.rmSync(targetStaticPath, { recursive: true, force: true });
        }
        // Копируем новую
        fs.cpSync(reactStaticPath, targetStaticPath, { recursive: true });
        console.log('✅ React файлы скопированы в public/static');
    } else {
        console.warn('⚠️ Папка static не найдена в сборке React');
    }

    // Копируем index.html
    const indexPath = path.join(buildPath, 'index.html');
    const targetIndexPath = path.join(targetPath, 'static', 'react.html');

    console.log(`📄 Копирование ${indexPath} -> ${targetIndexPath}`);
    fs.copyFileSync(indexPath, targetIndexPath);

    // Показываем содержимое public/static
    if (fs.existsSync(targetStaticPath)) {
        const files = fs.readdirSync(targetStaticPath, { recursive: true });
        console.log('\n📋 Скопированные файлы:');
        files.forEach((file) => console.log(`   - ${file}`));
    }

    console.log('\n✨ Готово! React приложение доступно по URL: /react.html');
} catch (error) {
    console.error('❌ Ошибка сборки:', error);
    process.exit(1);
}

function buildRaeactProject() {}
