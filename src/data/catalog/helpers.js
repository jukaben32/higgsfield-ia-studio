// Ayudas compartidas por todos los archivos del catálogo.
// El catálogo lo leen la página (para dibujar las opciones) y el servidor
// (para validar y armar el pedido a KIE), por eso aquí NUNCA va ninguna clave.

// Convierte una lista de resoluciones en opciones { id, label } para los "chips"
export const resolutions = (...ids) => ids.map((id) => ({ id, label: id }));

// Lista de números enteros de `min` a `max` (para duraciones fijas)
export const range = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i);

// ---------------------------------------------------------------------------
// Forma de una entrada de VIDEO en el catálogo
//
//   id              identificador interno (el que manda la página)
//   name, creator   nombre y empresa, se muestran en la lista de modelos
//   desc            frase corta para elegir el modelo
//   ratios          formatos permitidos; [] = el modelo no los usa (se toma de la foto)
//   ratioWithImage  false = con foto el formato lo decide la foto (se oculta el selector)
//   qualities       opciones de calidad / resolución [{ id, label }]
//   minDuration, maxDuration   rango en segundos (se dibuja un control deslizante)
//   durations       lista exacta de duraciones permitidas (se dibujan como botones)
//   sound           true si el modelo permite activar/desactivar el sonido
//   image           'optional' | 'required' | 'none' según el uso de la foto inicial
//   maxPrompt       largo máximo de la descripción (por defecto 2500)
//   validate(p)     opcional: devuelve un texto de error si la combinación no es válida
//   build(p)        arma { kieModel, input } exacto para KIE a partir de
//                   p = { prompt, imageUrl, ratio, duration, quality, sound }
//
// Forma de una entrada de IMAGEN: igual, pero sin duraciones ni sonido, con
//   maxRefs         cuántas fotos de referencia acepta (0 = ninguna)
//   build(p)        con p = { prompt, ratio, quality, refs }
//
// Cada modelo cita su página de documentación para poder revisarlo:
//   https://docs.kie.ai/market/<ruta>
// ---------------------------------------------------------------------------
