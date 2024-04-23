export function generateSigRevision(ultimoFolio: string): string {
  if (ultimoFolio === '-' || !ultimoFolio) return 'A';
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let folio = ultimoFolio.split('');

  // Se recorre el folio de derecha a izquierda
  for (let i = folio.length - 1; i >= 0; i--) {
    // Si el carácter actual es 'Z', se cambia a 'A' y se continúa con el siguiente carácter
    if (folio[i] === 'Z') {
      folio[i] = 'A';
    } else {
      // Si el carácter actual no es 'Z', se reemplaza con el siguiente carácter en el alfabeto y se finaliza el bucle
      folio[i] = alfabeto[alfabeto.indexOf(folio[i]) + 1];
      break;
    }
  }

  // Si se llega al primer carácter y es 'Z', se añade un nuevo carácter 'A' al inicio
  if (folio[0] === 'Z') {
    folio.unshift('A');
  }

  // Se devuelve el nuevo folio como una cadena
  return folio.join('');
}
