import ViewsRoutes from './views';
import ScannerRoutes from './scanner';
import ClientesRoutes from './clientes';
import OrdenesCompra from './ordenes_compra'
export const viewsRoutes = [ViewsRoutes, OrdenesCompra];
export const apiRoutes = [ScannerRoutes, ClientesRoutes];
