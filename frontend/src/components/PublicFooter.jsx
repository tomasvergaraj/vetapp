import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function PublicFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-ink text-white" id="contacto">
      <div className="container-edge grid gap-12 py-16 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm text-white/60 leading-relaxed">
            Atención veterinaria a domicilio en la Región de Valparaíso.
            Servicios profesionales para perros y gatos en la comodidad de tu hogar.
          </p>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-white">Contacto</h4>
          <ul className="mt-5 space-y-2.5 text-sm text-white/70">
            <li>
              <a href="mailto:hola@veterinaria.local" className="hover:text-white transition">
                hola@veterinaria.local
              </a>
            </li>
            <li>
              <a href="tel:+56900000000" className="hover:text-white transition">
                +56 9 0000 0000
              </a>
            </li>
            <li className="text-white/50">Lunes a sábado · 9:00 a 19:00</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-white">Información</h4>
          <ul className="mt-5 space-y-2.5 text-sm text-white/70">
            <li>
              <Link to="/solicitar" className="hover:text-white transition">
                Solicitar atención
              </Link>
            </li>
            <li>
              <a href="#servicios" className="hover:text-white transition">
                Servicios
              </a>
            </li>
            <li>
              <a href="#preguntas" className="hover:text-white transition">
                Preguntas frecuentes
              </a>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-white transition">
                Acceso veterinaria
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-edge flex flex-col items-start gap-3 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Veterinaria a domicilio. Todos los derechos reservados.</p>
          <p className="max-w-md sm:text-right">
            Este servicio no reemplaza atención veterinaria de urgencia.
            En caso de emergencia grave, acude a una clínica veterinaria cercana.
          </p>
        </div>
      </div>
    </footer>
  )
}
