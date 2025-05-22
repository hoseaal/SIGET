export class Validaciones {
  static username (username) {
    if (typeof username !== 'string') throw new Error('El username está vacío')
    if (username.length < 3) throw new Error('El username debe tener mínimo 3 caracteres')
  }

  static password (password) {
    if (typeof password !== 'string') throw new Error('La contraseña está vacía')
  }

  static errors (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2' ||
      error.code === 'ER_ROW_IS_REFERENCED_2' ||
      error.sqlMessage?.includes('foreign key constraint fails')) {
      throw new Error('La cédula no existe en el sistema de personal')
    }
  }
}
