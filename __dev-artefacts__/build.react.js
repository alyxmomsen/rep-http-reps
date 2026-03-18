/* что делает ? */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Сборка React приложения...');

try {
    // Переходим в папку client и запускаем сборку
    process.chdir('./client');
    execSync('npm install', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('✅ React приложение собрано!');
    
    const buildPath = path.join(__dirname, 'client', 'build');
    const targetPath = path.join(__dirname, 'public');

    // Копируем index.html отдельно
    fs.copyFileSync(
        path.join(buildPath, 'index.html'),
        path.join(targetPath, 'react.html')
    );

    // Копируем статику React в public/static
    const reactStaticPath = path.join(buildPath, 'static');
    const targetStaticPath = path.join(targetPath, 'static');

    if (fs.existsSync(targetStaticPath)) {
        fs.rmSync(targetStaticPath, { recursive: true, force: true });
    }
    fs.cpSync(reactStaticPath, targetStaticPath, { recursive: true });

    console.log('✅ React файлы скопированы в public/static');
    
} catch (error) {
    console.error('❌ Ошибка сборки:', error);
    process.exit(1);
}