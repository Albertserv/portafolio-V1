# Código que revela la lupa al pasar el mouse sobre la captura de cada proyecto.
# Son fragmentos ilustrativos de cómo funciona cada uno por dentro: reemplazalos por
# código real cuando quieras. La clave es el slug del proyecto en Portafolio::PROYECTOS.
# lenguaje: "js", "ruby" o "python" (para los colores).
module PortafolioCodigo
  SNIPPETS = {
    "millonai" => {
      archivo: "routes/whatsapp.js",
      lenguaje: "js",
      codigo: <<~'CODE'
        // Webhook de WhatsApp: cada mensaje se vuelve un gasto
        router.post("/webhook/whatsapp", async (req, res) => {
          const { from, type, body, media } = parseMessage(req.body)
          const usuario = await Usuario.findOne({ telefono: from })

          // Texto, audio o foto del ticket: todo pasa por la IA
          const contenido = type === "audio"
            ? await transcribir(media)
            : type === "image" ? await leerTicket(media) : body

          const gasto = await ia.clasificar(contenido, {
            moneda: "PYG",
            categorias: ["Supermercado", "ANDE", "IPS", "Combustible"],
          })

          await Gasto.create({ ...gasto, usuario: usuario.id })
          const total = await Gasto.totalDelMes(usuario.id)

          await whatsapp.responder(from,
            `Registrado ✓ Gs. ${formatear(gasto.monto)} en ${gasto.categoria}. ` +
            `Llevás Gs. ${formatear(total)} este mes.`)
          res.sendStatus(200)
        })
      CODE
    },

    "redfin" => {
      archivo: "app/models/simulador_factura.rb",
      lenguaje: "ruby",
      codigo: <<~'CODE'
        # Simulador de descuento de facturas
        class SimuladorFactura
          TASA_INTERES = 0.0142
          COMISION     = 0.0158
          RESERVA      = 0.05
          IVA          = 0.10

          def initialize(monto:, emision:, vencimiento:, moneda: "PYG")
            @monto  = monto
            @dias   = (vencimiento - emision).to_i
            @moneda = moneda
          end

          def calcular
            bruto    = @monto * (1 - RESERVA)
            interes  = bruto * TASA_INTERES * (@dias / 30.0)
            comision = bruto * COMISION
            iva      = (interes + comision) * IVA

            {
              monto_bruto: bruto.round,
              reserva:     (@monto * RESERVA).round,
              costo_total: (interes + comision + iva).round,
              liquido:     (bruto - interes - comision - iva).round
            }
          end
        end
      CODE
    },

    "sparky" => {
      archivo: "app/services/reservar_turno.rb",
      lenguaje: "ruby",
      codigo: <<~'CODE'
        # Reservar un turno sin que dos clientes se pisen
        class ReservarTurno
          def call(negocio:, cliente:, servicio:, inicio:)
            fin = inicio + servicio.duracion

            Turno.transaction do
              ocupado = negocio.turnos.lock
                               .where(estado: [:pendiente, :confirmado])
                               .where("inicio < ? AND fin > ?", fin, inicio)
                               .exists?
              raise HorarioOcupado if ocupado

              turno = negocio.turnos.create!(
                cliente:  cliente,
                servicio: servicio,
                inicio:   inicio,
                fin:      fin,
                estado:   :pendiente
              )

              # Antes de la cita le pide al cliente "SÍ" o "CANCELAR"
              ConfirmacionJob.set(wait_until: inicio - 3.hours).perform_later(turno)
              turno
            end
          end
        end
      CODE
    },

    "zap-pulse" => {
      archivo: "webhooks/whatsapp.py",
      lenguaje: "python",
      codigo: <<~'CODE'
        # Responder a un cliente en segundos, como lo haría el dueño
        @app.post("/webhook/whatsapp")
        async def nuevo_mensaje(evento: MensajeEntrante):
            tienda = await Tienda.por_numero(evento.destino)
            historial = await Conversacion.ultimos(evento.origen, limite=12)

            productos = await tienda.catalogo.buscar(evento.texto, top=5)

            respuesta = await llm.responder(
                sistema=tienda.instrucciones,
                contexto={"productos": productos, "horarios": tienda.horarios},
                historial=historial,
                mensaje=evento.texto,
            )

            if respuesta.intencion == "pedido":
                pedido = await Pedido.crear(tienda, evento.origen, respuesta.items)
                await notificar_dueno(tienda, f"¡Nueva venta! Pedido {pedido.id}")

            await whatsapp.enviar(evento.origen, respuesta.texto)
            return {"ok": True}
      CODE
    },

    "quiro-ai" => {
      archivo: "qbooks/generador.py",
      lenguaje: "python",
      codigo: <<~'CODE'
        # Generar un Qbook personalizado a partir del Ikigai
        async def generar_qbook(usuario: Usuario) -> Qbook:
            perfil = await Perfil.de(usuario)
            ikigai = {
                "lo_que_amas": perfil.pasiones,
                "lo_que_haces_bien": perfil.talentos,
                "lo_que_el_mundo_necesita": perfil.causas,
                "por_lo_que_te_pagan": perfil.oficios,
            }

            capitulos = []
            for tema in PLANTILLA_QBOOK:
                texto = await llm.generar(
                    prompt=tema.prompt,
                    variables={"ikigai": ikigai, "nombre": usuario.nombre},
                    temperatura=0.8,
                )
                capitulos.append(Capitulo(titulo=tema.titulo, texto=texto))

            qbook = await Qbook.crear(usuario=usuario, capitulos=capitulos)
            await QCoach.iniciar_sesion(usuario, qbook)
            return qbook
      CODE
    },

    "pro-aqua" => {
      archivo: "app/models/carrito.rb",
      lenguaje: "ruby",
      codigo: <<~'CODE'
        # Carrito: totales en guaraníes, con descuentos y envío
        class Carrito < ApplicationRecord
          has_many :items, dependent: :destroy

          def subtotal
            items.sum { |item| item.precio_unitario * item.cantidad }
          end

          def descuento
            items.sum { |item| item.producto.ahorro * item.cantidad }
          end

          def envio
            return 0 if subtotal >= 5_000_000
            Envio.tarifa_para(ciudad)
          end

          def total
            subtotal - descuento + envio
          end

          def mensaje_whatsapp
            "Hola! Quiero comprar: " +
              items.map { |i| "#{i.cantidad}x #{i.producto.nombre}" }.join(", ")
          end
        end
      CODE
    },

    "reckado" => {
      archivo: "src/lista.js",
      lenguaje: "js",
      codigo: <<~'CODE'
        // Avisar antes de pasarse del presupuesto del súper
        export function revisarLista(lista) {
          const total = lista.items.reduce(
            (suma, item) => suma + item.precio * item.cantidad, 0
          )
          const restante = lista.presupuesto - total

          // Lo que se agregó en el súper y no estaba planificado
          const impulsivos = lista.items.filter(
            (item) => !item.planificado && item.agregadoEn > lista.inicioCompra
          )

          return {
            total,
            restante,
            excedido: restante < 0,
            alerta: impulsivos.length > 0
              ? `Agregaste ${impulsivos.length} cosas que no estaban en la lista`
              : null,
          }
        }
      CODE
    },

    "guarani-a-letras" => {
      archivo: "index.js",
      lenguaje: "js",
      codigo: <<~'CODE'
        // 12345 → "DOCE MIL TRESCIENTOS CUARENTA Y CINCO GUARANÍES"
        function centenas(n) {
          if (n === 100) return "CIEN"
          const c = Math.floor(n / 100)
          return [CENTENAS[c], decenas(n % 100)].filter(Boolean).join(" ")
        }

        function NumeroALetras(numero, conMoneda = false) {
          const entero = Math.floor(numero)
          const millones = Math.floor(entero / 1_000_000)
          const miles = Math.floor((entero % 1_000_000) / 1000)
          const resto = entero % 1000

          const partes = [
            millones && seccion(millones, "MILLÓN", "MILLONES"),
            miles && (miles === 1 ? "MIL" : `${centenas(miles)} MIL`),
            resto && centenas(resto),
          ].filter(Boolean)

          return partes.join(" ") + (conMoneda ? " GUARANÍES" : "")
        }

        module.exports = { NumeroALetras }
      CODE
    }
  }.freeze

  def self.para(slug) = SNIPPETS[slug]
end
