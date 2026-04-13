export class validaciones {
    static async number(id){
        if (!/^[0-9]+$/.test(id)) throw new Error("Debe ser un número entero")
        if(typeof id === 'string') throw new Error("Tipo de dato inválido. Debe ser tipo int")
    }
    static async string(texto){
        if (typeof texto !== 'string' || texto.trim() === '') throw new Error('Debe ser un texto no vacío')
    }
    static username (username) {
        if (typeof username !== 'string') throw new Error('Username inválido')
        if (username.length < 3) throw new Error('Username muy corto')
    }
    static password (password) {
        if (typeof password != 'string') throw new Error('Contraseña inválida')
        if (password.length < 4) throw new Error('Contraseña muy corta')
    }
}