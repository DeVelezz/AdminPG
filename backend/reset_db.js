const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function executeSQLFile() {
    let connection;
    try {
        console.log('🔄 Conectando a la base de datos...');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'adminpg',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('✅ Conectado a la base de datos');
        console.log('📂 Leyendo archivo SQL...');

        const sqlFile = path.join(__dirname, 'dev-tools', 'reset_database_fresh.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        console.log('🚀 Ejecutando script SQL...');
        console.log('⚠️  Esto eliminará TODOS los datos actuales y creará datos nuevos');
        
        await connection.query(sqlContent);

        console.log('\n✅ ¡Base de datos repoblada exitosamente!');
        console.log('\n📊 RESUMEN:');
        console.log('   • 1 Administrador creado');
        console.log('   • 10 Residentes creados');
        console.log('   • Todos con datos completos (nombre, email, teléfono, torre, apartamento)');
        console.log('   • Historial de pagos de 2-4 meses');
        console.log('   • TODOS los servicios tienen datos de pago completos');
        console.log('   • SIN datos NULL');
        console.log('\n🔑 CREDENCIALES:');
        console.log('   Admin: admin@adminpg.com / admin123');
        console.log('   Residentes: (ver archivo SQL) / admin123');
        
    } catch (error) {
        console.error('❌ Error ejecutando el script:', error.message);
        if (error.sql) {
            console.error('SQL:', error.sql.substring(0, 200) + '...');
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Conexión cerrada');
        }
    }
}

executeSQLFile();
