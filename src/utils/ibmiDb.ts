import { loadBase,getInstance } from './ibmiConnection'; // Adjust the import path accordingly

export async function checkConnection() {
  const ibmi = loadBase();

  if (!ibmi) {
    console.error('Code for IBM i extension is not loaded.');
    return;
  }

  const instance = getInstance();

  if (!instance) {
    console.error('No active IBM i connection found.');
    return;
  }

  console.log('Connected to IBM i!');
}


function formatSchemaDescription(
    rows: { TABLE_NAME: string; COLUMN_NAME: string; DATA_TYPE: string }[],
    includeHeader = true,
    databaseName = 'SNDBX89'
  ): string {
    const schemaMap: { [tableName: string]: { columnName: string; dataType: string }[] } = {};
  
    for (const row of rows) {
      const tableName = row.TABLE_NAME.trim();
      const columnName = row.COLUMN_NAME.trim();
      const dataType = row.DATA_TYPE.trim();
  
      if (!schemaMap[tableName]) {
        schemaMap[tableName] = [];
      }
  
      schemaMap[tableName].push({ columnName, dataType });
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
      return `Here are the tables and columns in the '${databaseName}' database:\n\n${schemaDescription}`;
    } else {
      return schemaDescription;
    }
}




export async function getDatabaseContext() {
    const ibmi = loadBase();

    if (!ibmi) {
      console.error('Code for IBM i extension is not loaded.');
      return;
    }
    const instance = getInstance();
    if (!instance) {
      console.error('No active IBM i connection found.');
      return;
    }

    const sql = `
      SELECT 
        c.TABLE_NAME,
        c.COLUMN_NAME,
        c.DATA_TYPE
      FROM 
        QSYS2.SYSCOLUMNS c
      JOIN 
        QSYS2.SYSTABLES t
        ON c.TABLE_NAME = t.TABLE_NAME
        AND c.TABLE_SCHEMA = t.TABLE_SCHEMA
      WHERE 
        c.TABLE_SCHEMA = 'SNDBX89'
        AND t.TABLE_TYPE = 'T'
        AND t.SYSTEM_TABLE = 'N'
      ORDER BY 
        c.TABLE_NAME,
        c.ORDINAL_POSITION
    `;

    try {
        // Attempt to execute a simple command to verify the connection
        const result = await instance.getConnection().runSQL(sql);
        const formattedResult = result.map(row => ({
            TABLE_NAME: String(row.TABLE_NAME).trim(),
            COLUMN_NAME: String(row.COLUMN_NAME).trim(),
            DATA_TYPE: String(row.DATA_TYPE).trim()
        }));
        const schemaText = formatSchemaDescription(formattedResult, true, 'SNDBX89');
        return schemaText;

        
    } catch (error) {
        console.error('Failed to execute command. Connection might be inactive.', error);
    }
}