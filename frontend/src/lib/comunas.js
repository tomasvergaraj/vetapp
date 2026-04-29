// Comunas de la Región de Valparaíso (V Región)
// Fuente: División político-administrativa de Chile — BCN

export const COMUNAS_POR_PROVINCIA = [
  {
    provincia: 'Provincia de Valparaíso',
    comunas: ['Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero', 'Valparaíso', 'Viña del Mar'],
  },
  {
    provincia: 'Provincia de Isla de Pascua',
    comunas: ['Isla de Pascua'],
  },
  {
    provincia: 'Provincia de Los Andes',
    comunas: ['Calle Larga', 'Los Andes', 'Rinconada', 'San Esteban'],
  },
  {
    provincia: 'Provincia de Marga Marga',
    comunas: ['Limache', 'Olmué', 'Quilpué', 'Villa Alemana'],
  },
  {
    provincia: 'Provincia de Petorca',
    comunas: ['Cabildo', 'La Ligua', 'Papudo', 'Petorca', 'Zapallar'],
  },
  {
    provincia: 'Provincia de Quillota',
    comunas: ['Hijuelas', 'La Calera', 'La Cruz', 'Nogales', 'Quillota'],
  },
  {
    provincia: 'Provincia de San Antonio',
    comunas: ['Algarrobo', 'Cartagena', 'El Quisco', 'El Tabo', 'San Antonio', 'Santo Domingo'],
  },
  {
    provincia: 'Provincia de San Felipe de Aconcagua',
    comunas: ['Catemu', 'Llaillay', 'Panquehue', 'Putaendo', 'San Felipe', 'Santa María'],
  },
]

export const TODAS_LAS_COMUNAS = COMUNAS_POR_PROVINCIA
  .flatMap(({ comunas }) => comunas)
  .sort((a, b) => a.localeCompare(b, 'es'))
