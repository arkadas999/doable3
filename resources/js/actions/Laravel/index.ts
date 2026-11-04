import Cashier from './Cashier'
import Fortify from './Fortify'
import Passkeys from './Passkeys'

const Laravel = {
    Cashier: Object.assign(Cashier, Cashier),
    Fortify: Object.assign(Fortify, Fortify),
    Passkeys: Object.assign(Passkeys, Passkeys),
}

export default Laravel