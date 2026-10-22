// Public content and optional links live here. Leave unknown URLs as null.
export const site = {
  name: 'Baldovino',
  role: 'Desarrollador Full Stack .NET',
  description: 'Portfolio de desarrollo Full Stack .NET con proyectos web modernos, escalables y orientados a resolver problemas reales.',
  url: null,
  links: {
    github: 'https://github.com/baldovinob93',
    linkedin: 'https://www.linkedin.com/in/brian-baldovino-791b993b9',
    email: 'mailto:baldovinob93@gmail.com'
  }
};

const nib = '/assets/nib/';

export const projects = [
  {
    slug: 'nib-indumentary',
    name: 'N|B Indumentary',
    mark: 'N|B',
    markCaption: 'INDUMENTARY',
    eyebrow: 'PROYECTO DESTACADO',
    summary: 'E-commerce de indumentaria diseñado y desarrollado como una experiencia completa de compra y gestión.',
    description: 'Una tienda online responsive que integra catálogo, variantes, carrito, checkout, pagos, seguimiento de pedidos y administración desde una misma plataforma.',
    stack: ['ASP.NET Core MVC', 'Razor', 'Entity Framework Core', 'SQL Server', 'JavaScript', 'Bootstrap', 'Mercado Pago', 'Responsive'],
    hero: { desktop: `${nib}home-desktop.webp`, mobile: `${nib}home-mobile.webp` },
    demoUrl: null,
    githubUrl: null,
    featured: true,
    sections: [
      {
        number: '01', label: 'Portada', title: 'N|B Indumentary',
        description: 'E-commerce de indumentaria diseñado y desarrollado como una experiencia completa de compra y gestión. Una tienda online responsive que integra catálogo, variantes, carrito, checkout, pagos, seguimiento de pedidos y administración desde una misma plataforma.',
        media: [{ src: `${nib}home-desktop.webp`, alt: 'Portada de N|B Indumentary en escritorio, con colección e identidad visual', type: 'desktop' }]
      },
      {
        number: '02', label: 'Responsive', title: 'Diseñado para desktop y mobile',
        description: 'La experiencia se adapta a distintos tamaños de pantalla manteniendo la identidad visual, la navegación y las acciones principales accesibles durante todo el recorrido.',
        media: [
          { src: `${nib}home-desktop.webp`, alt: 'Inicio de la tienda en escritorio', type: 'desktop' },
          { src: `${nib}home-mobile.webp`, alt: 'Inicio de la tienda en móvil', type: 'mobile' }
        ]
      },
      {
        number: '03', label: 'Catálogo', title: 'Explorar antes de comprar',
        description: 'Colecciones, productos destacados y navegación visual ayudan a descubrir el catálogo sin saturar la interfaz. En mobile, la experiencia conserva el foco en el producto y simplifica la navegación.',
        media: [
          { src: `${nib}colecciones-desktop.webp`, alt: 'Colecciones de indumentaria en escritorio', type: 'desktop' },
          { src: `${nib}productos-mobile.webp`, alt: 'Listado de productos en móvil', type: 'mobile' }
        ]
      },
      {
        number: '04', label: 'Producto', title: 'Toda la información, en el momento correcto',
        description: 'Cada producto concentra precio, disponibilidad, variantes y acciones de compra en una interfaz clara, dejando que la fotografía sea la protagonista.',
        media: [{ src: `${nib}producto-desktop.webp`, alt: 'Detalle de un buzo con variantes y acción de compra', type: 'desktop' }]
      },
      {
        number: '05', label: 'Carrito', title: 'Un carrito simple y transparente',
        description: 'El usuario puede revisar productos, cantidades y totales antes de avanzar, con una jerarquía visual que mantiene clara la acción principal sin esconder información importante.',
        media: [{ src: `${nib}carrito-desktop.webp`, alt: 'Carrito con productos, cantidades y resumen de compra', type: 'desktop' }]
      },
      {
        number: '06', label: 'Checkout', title: 'Checkout guiado paso a paso',
        description: 'Los datos de compra se organizan en etapas para reducir fricción y permitir que el cliente revise su información antes de confirmar el pedido.',
        media: [{ src: `${nib}checkout-desktop.webp`, alt: 'Formulario de checkout con datos personales ocultos para esta presentación', type: 'desktop' }]
      },
      {
        number: '07', label: 'Pago', title: 'Pago integrado con Mercado Pago',
        description: 'El flujo continúa hacia Mercado Pago para completar la operación en un entorno familiar para el comprador, manteniendo una transición clara desde la tienda.',
        media: [{ src: `${nib}mercado-pago-desktop.webp`, alt: 'Pantalla de pago de Mercado Pago', type: 'desktop' }]
      },
      {
        number: '08', label: 'Seguimiento', title: 'Seguimiento completo del pedido',
        description: 'Después de comprar, el cliente puede consultar el avance de su pedido desde la recepción hasta la entrega. El estado de pago, preparación y envío se presenta como un recorrido fácil de interpretar tanto en desktop como en mobile.',
        media: [
          { src: `${nib}seguimiento-desktop.webp`, alt: 'Seguimiento de pedido en escritorio', type: 'desktop' },
          { src: `${nib}seguimiento-mobile.webp`, alt: 'Seguimiento de pedido en móvil', type: 'mobile' }
        ]
      },
      {
        number: '09', label: 'Acceso', title: 'Administración independiente',
        description: 'La tienda cuenta con un acceso administrativo separado de la experiencia pública, pensado para centralizar la operación diaria del negocio.',
        media: [{ src: `${nib}admin-login-mobile.webp`, alt: 'Acceso administrativo de N|B en móvil', type: 'mobile' }]
      },
      {
        number: '10', label: 'Panel', title: 'Una tienda que también se puede gestionar',
        description: 'El panel reúne información clave del negocio como productos, variantes, stock y ventas en una vista rápida. La administración también está preparada para pantallas pequeñas, permitiendo consultar el estado general desde mobile.',
        media: [
          { src: `${nib}admin-dashboard-desktop.webp`, alt: 'Panel de administración en escritorio', type: 'desktop' },
          { src: `${nib}admin-dashboard-mobile.webp`, alt: 'Panel de administración en móvil', type: 'mobile' }
        ]
      },
      {
        number: '11', label: 'Cierre', title: 'Más que una interfaz',
        description: 'N|B Indumentary fue desarrollado como un flujo completo: descubrir un producto, comprarlo, pagar, seguir el pedido y administrar la operación desde el mismo sistema.',
        media: []
      }
    ]
  }
];
