# 1
linkId means that:
файл разбивается на несколько частей,- 
- сам файл (бинарные данные) 
    - для сторринга в fs
- мета-данные (для бд (postres, mongo...)), 
такие как filename, content-type...
    - из них сформируется запись в бд, - 
    originalFilename, mime, body (для записи в ФС и получения автоматического имени в ФС)
- автоматические данные (для бд) для создания колонки в строке таблицы
    - column-name, data-type, body, tableName, groupId
# 1.1 добавить детали
добавить детали для записи 1.1
# 1.2 детали для 1.1
### 1.2.1 base
В текущей архитектуре, файл не сохраняется в базу данных (БД), он сохраняется в файловую систему (ФС) 
При этом мета-данные файла (content-type, filename) будут преобразованы в (mime и originalFilename, соответственно).
И будет сформирована группа данных вида:
```js
/* несмердженные данные в текущей итерации*/
const data = {
    '__tableName':{
        '__groupId':{
            mime:{
                data:'mime/type',
                dataType:'string',
            },
            originalFilename:{
                data:'original-filename.ext',
                dataType:'string'
            },
            // данные файла потом будут отправлены в filemanager
            // и взамен получен fs_filename, который будет использован для записи в БД
            body:Buffer.from('here is a data of a true file'),
            ...('дополнить, если чего то не хватает' && {})
        },
    },
}
```
### 1.2.2