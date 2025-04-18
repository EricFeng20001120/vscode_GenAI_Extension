import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

interface SchemaRow extends RowDataPacket {
	TABLE_NAME: string;
	COLUMN_NAME: string;
	DATA_TYPE: string;
}

export async function connectToDatabase() {
	const connection = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'world',
	});
	return connection;
}

export async function getDatabaseContext(includeHeader = true): Promise<string> {
	const connection = await connectToDatabase();

	const [rows] = await connection.query<SchemaRow[]>(
		`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, ORDINAL_POSITION;
      `,
		[connection.config.database],
	);

	await connection.end();

	const schemaMap: { [tableName: string]: { columnName: string; dataType: string }[] } = {};

	for (const row of rows) {
		if (!schemaMap[row.TABLE_NAME]) {
			schemaMap[row.TABLE_NAME] = [];
		}
		schemaMap[row.TABLE_NAME].push({ columnName: row.COLUMN_NAME, dataType: row.DATA_TYPE });
	}

	let schemaDescription = '';

	for (const [tableName, columns] of Object.entries(schemaMap)) {
		schemaDescription += `Table: ${tableName}\n`;
		for (const column of columns) {
			schemaDescription += `  - ${column.columnName} (${column.dataType})\n`;
		}
		schemaDescription += '\n';
	}

	if (includeHeader) {
		return `Here are the tables and columns in the '${connection.config.database}' database:\n\n${schemaDescription}`;
	} else {
		return schemaDescription;
	}
}
