// Función reutilizable para obtener el color de estado en tablas
export default function getStatusColor(estado) {
    switch (estado?.toLowerCase()) {
        case 'al dia':
            return 'bg-green-100 text-green-700';
        case 'en mora':
            return 'bg-red-100 text-red-700';
        case 'por vencer':
            return 'bg-yellow-100 text-yellow-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}
