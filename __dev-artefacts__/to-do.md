# services

## router

### features

- параметры в URL:
	/path/:param_1/path/:param_2
- санитайзинг конечного слеша:
	/path/ => /path
- параметры в queryString
	/path?param_1=value&param_2=value будет расммотренно как url "/path" queryString "param_1=value&param_2=value"
	/path/?param_1=value&param_2=value будет расммотренно как url "/path" queryString "param_1=value&param_2=value"
- роутинг для статики:
	"/path/\*"
	где \* это любая последовательность
- или с поддержкой
	"/path/*/path" 
	где вместо * можно поместить любую символьную последовательность

## group-multitable-form-data

поддержка multi-table request без javascript

for example:
name="G21.playlist-1.title.string"

### describition:

name="<groupId>.<tableName>.<columnName>.<columnDataType>
- <groupId> работает в связке с <tableName> 
	это значит что для одного и того же <groupId> должен быть один и тот же <tableName>
	
на сервере данные группируются по <groupId>

```js

	const parsedFormDataPart = {
		groupId:'group-id' ,
		tableName:'table-name',
		columnName:'column-name',
		columnDataType
	}

	const groups = {
		[<groupId>]:{
			<tableName>:'tableName',
			files:[
				{
					mime:'video/mpeg4',
					filename:'HTML-form-data_content-disposition_filename-attr_value',
					fileBody:Buffer,
					columnName:'from file-input-name-attr-segment <columnName>',
				},
			],
			tableColumns:new Map([
				[
					'columnName' ,
					{
						dataType:'js type',
						data:'string',
					},
				],
			]),
		}
	}

```

### todo

#### features

- кодирование name аттрибута на сервере,- делаем хэш типа `u13212g3h1jiu1t321ut321vg3m1231m231g2v31jh2g3`. 
	- name аттрибут должен быть `human-friendly-not`.
	- сервер декодирует и получает: `name="<groupId>.<tableName>.<columnName>.<columnDataType>`
- name аттрибут должен включать в себя код протокола, который на сервере применяется для роутинга по `name-attribute-parser`[], т.е. для каждого отдельного протокола свой парсер (что логично). Предположительно выглядит это так: `name="<protocol>: <groupId>.<tableName>.<columnName>.<columnDataType>`

на сервере:

```js
const nameAttributePasers = new Map(); 
name nameAttributePasers.set('protocolIdString' , (nameAttr) => {
	// name attribute parser
} )
```

# terms

миграция
санитайзинг