const {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const { createReadStream, writeFileSync, existsSync } = require('fs');
const { resolve } = require('path');

const s3 = new S3Client({
    region: 'ru-1',
    endpoint: 'https://s3.twcstorage.ru',
    credentials: {
        accessKeyId: '0J04OYN6R29ROR7MCOAS',
        secretAccessKey: 'mQ8K8eeTBLVNtgqQ2y6SnAAp7J5VQUhGFyqQXmLZ',
    },
});

async function uploadFile(bucketName, key, filePath) {
    try {
        const fileStream = createReadStream(resolve(filePath));
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
        });

        const response = await s3.send(command);
        console.log('✅ Файл загружен:', key);
        return response;
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error.message);
        throw error;
    }
}

async function listObjects(bucketName) {
    try {
        const command = new ListObjectsV2Command({ Bucket: bucketName });
        const response = await s3.send(command);

        if (response.Contents) {
            console.log(`\n📁 Объекты в бакете ${bucketName}:`);
            response.Contents.forEach((obj) =>
                console.log(
                    `  - ${obj.Key} (${obj.Size} bytes, изменён: ${obj.LastModified})`
                )
            );
            return response.Contents;
        } else {
            console.log('Бакет пуст');
            return [];
        }
    } catch (error) {
        console.error('❌ Ошибка получения списка:', error.message);
        throw error;
    }
}

async function main() {
    console.log('🚀 Начинаем тестирование Timeweb S3...\n');

    const bucketName = 'e7a7869b-5321-4677-88da-dc499859d662';

    // Создаём тестовый файл
    const testFilePath = resolve(
        `C:\\Users\\user\\Downloads\\Черное_зеркало_5_сезон_-_0_серия.mp4`
    );
    const testContent = `Тестовый файл создан ${new Date().toISOString()}`;

    console.log('📝 Создаём тестовый файл:', testFilePath);
    writeFileSync(testFilePath, testContent);
    console.log('✅ Тестовый файл создан\n');

    try {
        // 1. Проверяем соединение - получаем список файлов
        console.log('1️⃣ Проверяем соединение с бакетом...');
        const files = await listObjects(bucketName);
        console.log(`   Найдено ${files.length} файлов\n`);

        // 2. Загружаем файл
        console.log('2️⃣ Загружаем файл...');
        await uploadFile(bucketName, `test-${Date.now()}.txt`, testFilePath);

        // 3. Снова получаем список файлов, чтобы увидеть новый файл
        console.log('\n3️⃣ Получаем обновлённый список...');
        const updatedFiles = await listObjects(bucketName);
        console.log(`   Теперь в бакете ${updatedFiles.length} файлов\n`);

        console.log('🎉 Тестирование завершено успешно!');
    } catch (error) {
        console.error('\n❌ Тестирование не удалось:', error.message);
        if (error.code === 'NoSuchBucket') {
            console.error('   Бакет не найден. Проверьте имя бакета!');
        } else if (error.code === 'InvalidAccessKeyId') {
            console.error('   Неверный ключ доступа!');
        } else if (error.code === 'SignatureDoesNotMatch') {
            console.error('   Неверный секретный ключ!');
        }
    }
}

// Запускаем тест
main();
