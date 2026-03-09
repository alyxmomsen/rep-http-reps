
class GroupFormData {

	pushOne(data) {

		const { groupId, tableName, columnName, columnContentType, columnValue } = data;
		
		const tableIdGroup = this.#groups.get(groupId);

        const groups = {
			'g1':{
				'playlist':{
                    row:{
                        'title':{
                            value:Buffer,
                            formData:'text',
                        },
                        'description':{
                            value:Buffer,
                            formData:'text',
                        },
                        'video':{
                            value:[Buffer],
                            formData:'video/mpeg4',
                        }
                    }
                }
			}
		}
		
	}

	#groups;

    constructor () {
		this.#groups = new Map();
    }
}

module.exports = { GroupFormData }