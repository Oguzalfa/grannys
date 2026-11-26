import { createRoot } from 'react-dom/client'
import Grannys from './grannys-app'
const root=createRoot(document.getElementById('root')!)
if (location.pathname.replace(/\/$/,'')==='/kasa') {
 import('./loyalty/Cashier').then(({default:Cashier})=>root.render(<Cashier/>))
} else root.render(<Grannys/>)
