// Arrays globales para almacenar datos
let clientes = [];
let manicuristas = [];
let citas = [];
let tratamientos = [];

// Variable para cliente pendiente de registro en agendamiento
let clienteRegistroPendiente = null;

// Objeto para filtros
let filtro = {
  nombrePaciente: '',
  nombreOdontologo: '',
  id: '',
  mes: '',
  dia: ''
};

/* FUNCIONES PARA ALMACENAMIENTO LOCAL (en este ejemplo, solo para pacientes) */
function cargarClientes() {
  const clientesLS = localStorage.getItem("clientes");
  if (clientesLS) {
    clientes = JSON.parse(clientesLS);
  }
}
function guardarClientes() {
  localStorage.setItem("clientes", JSON.stringify(pacientes));
}

/* Función para formatear números */
function formatNumber(num) {
  return Number(num).toLocaleString('es-ES', { maximumFractionDigits: 0 });
}

/* Función para mostrar un módulo y ocultar los demás */
function mostrarModulo(moduloId) {
  const modulos = document.querySelectorAll('.module');
  modulos.forEach(modulo => {
    modulo.classList.remove('active');
  });
  document.getElementById(moduloId).classList.add('active');

  if (moduloId === 'agendamiento') {
    actualizarSelects();
  }
  if (moduloId === 'citas') {
    cargarCitas();
    actualizarDatalistClientes();
  }
}

/* Actualizar selects del módulo de agendamiento */
function actualizarSelects() {
  const selectCliente = document.getElementById('select-cliente');
  const selectManicurista = document.getElementById('select-manicurista');
  const selectTratamiento = document.getElementById('select-tratamiento');

  selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';
  clientes.forEach((p, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${p.nombres} (${p.id})`;
    selectPaciente.appendChild(option);
  });

  selectManicurista.innerHTML = '<option value="">Seleccione una manicurita</option>';
  manicuristas.forEach((o, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${o.nombres} (${o.id})`;
    selectManicurista.appendChild(option);
  });

  selectTratamiento.innerHTML = '<option value="">Seleccione un tratamiento</option>';
  tratamientos.forEach((t, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = t.descripcion;
    selectTratamiento.appendChild(option);
  });
}

/* Actualizar datalist de clientes para autocompletar filtros */
function actualizarDatalistClientes() {
  const datalist = document.getElementById('datalist-clientes');
  datalist.innerHTML = '';
  clientes.forEach(p => {
    const option = document.createElement('option');
    option.value = p.nombres;
    datalist.appendChild(option);
  });
}

/* DISPONIBILIDAD MANICURISTAS */
document.getElementById('disp-month').addEventListener('change', function () {
  const val = this.value;
  const detailsList = document.querySelectorAll('#manicuristas details[data-week]');
  detailsList.forEach(d => {
    d.style.display = val ? 'block' : 'none';
  });
  updateDisponibilidadLabels();
});
function updateDisponibilidadLabels() {
  const monthInput = document.getElementById('disp-month').value;
  if (!monthInput) return;
  const [year, month] = monthInput.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00`);
  const offset = (firstDay.getDay() + 6) % 7;

  const detailsList = document.querySelectorAll('#form-manicuristas details[data-week]');
  detailsList.forEach(details => {
    const week = Number(details.dataset.week);
    const dias = details.querySelectorAll('.dia');
    dias.forEach((diaDiv, index) => {
      const dateNumber = (week - 1) * 7 + index + 1 - offset;
      const labelSpan = diaDiv.querySelector('.day-label');
      if (dateNumber < 1 || dateNumber > daysInMonth) {
        labelSpan.textContent = "No aplica";
        diaDiv.querySelectorAll('input[type="time"]').forEach(inp => inp.disabled = true);
      } else {
        diaDiv.querySelectorAll('input[type="time"]').forEach(inp => inp.disabled = false);
        const d = new Date(`${year}-${String(month).padStart(2, '0')}-${String(dateNumber).padStart(2, '0')}T00:00:00`);
        let weekday = d.toLocaleDateString('es-ES', { weekday: 'long' });
        weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        const monthYear = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        labelSpan.textContent = `${weekday} ${dateNumber} de ${monthYear}`;
      }
    });
  });
}
/* FIN DISPONIBILIDAD */

/* BUSCAR PACIENTE EN AGENDAMIENTO */
function buscarClienteAgendamiento() {
  const busqueda = document.getElementById('buscar-cliente').value.trim();
  if (!busqueda) {
    alert('Ingrese un criterio de búsqueda (nombres o identificación)');
    return;
  }
  const clienteEncontrado = clientes.find(p =>
    p.id.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nombres.toLowerCase().includes(busqueda.toLowerCase())
  );
  if (clienteEncontrado) {
    const selectCliente = document.getElementById('select-cliente');
    const indexEncontrado = clientes.indexOf(clienteEncontrado);
    selectCliente.value = indexEncontrado;
    alert('cliente encontrado y seleccionado.');
  } else {
    if (confirm('cliente no encontrado. ¿Desea registrarlo?')) {
      pacienteRegistroPendiente = busqueda;
      mostrarModulo('clientes');
      document.getElementById('cliente-id').value = busqueda;
    }
  }
}

/* REGISTRO DE CLIENTES */
document.getElementById('form-clientes').addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('cliente-id').value.trim();
  const nombres = document.getElementById('cliente-nombres').value.trim();
  const telefono = document.getElementById('cliente-telefono').value.trim();
  const correo = document.getElementById('cliente-correo').value.trim();

  // Nuevos campos
  const fechaNacimiento = document.getElementById('cliente-fechaNacimiento').value.trim();
  const edad = document.getElementById('cliente-edad').value.trim();
  const ciudad = document.getElementById('cliente-ciudad').value.trim();
  const sexo = document.getElementById('cliente-sexo').value;
  const estadoCivil = document.getElementById('cliente-estadoCivil').value;
  const motivoConsulta = document.getElementById('cliente-motivoConsulta').value.trim();

  // Antecedentes (arrays de valores de checkboxes)
  const antecedentesPersonal = Array.from(document.querySelectorAll('input[name="antecedente_personal[]"]:checked')).map(el => el.value);
  const antecedentesFamiliar = Array.from(document.querySelectorAll('input[name="antecedente_familiar[]"]:checked')).map(el => el.value);

  // Secciones de examen y plan
  const examenClinico = document.getElementById('cilente-examenClinico').value.trim();
  const odontograma = document.getElementById('cliente-odontograma').value.trim();
  const diagnostico = document.getElementById('cliente-diagnostico').value.trim();
  const planTratamiento = document.getElementById('cliente-planTratamiento').value.trim();

  // Validar que no exista ya un cliente con la misma identificación
  const clienteExistente = clientes.find(p => p.id === id);
  if (clienteExistente) {
    alert("Ya existe un cliente con esa identificación");
    return;
  }

  if (id && nombres && telefono && correo && fechaNacimiento && edad && ciudad && sexo && estadoCivil && motivoConsulta &&
    examenClinico && odontograma && diagnostico && planTratamiento) {
    clientes.push({
      id, nombres, telefono, correo,
      fechaNacimiento, edad, ciudad, sexo, estadoCivil, motivoConsulta,
      antecedentesPersonal, antecedentesFamiliar,
      examenClinico, odontograma, diagnostico, planTratamiento
    });
    guardarClientes();
    alert('Cliente registrado exitosamente');
    this.reset();
    if (clienteRegistroPendiente) {
      const nuevoIndex = clientes.findIndex(p => p.id === clienteRegistroPendiente);
      clienteRegistroPendiente = null;
      mostrarModulo('agendamiento');
      actualizarSelects();
      document.getElementById('select-paciente').value = nuevoIndex;
    }
  }
});

/* BOTONES ADICIONALES PARA CLIENTES */
// Buscar cliente y llenar el formulario con sus datos
function buscarCliente() {
  const criterio = document.getElementById('cliente-id').value.trim();
  if (!criterio) {
    alert("Ingrese la identificación o nombre del cliente a buscar");
    return;
  }
  const clienteEncontrado = pacientes.find(p =>
    p.id.toLowerCase() === criterio.toLowerCase() ||
    p.nombres.toLowerCase().includes(criterio.toLowerCase())
  );
  if (clienteEncontrado) {
    document.getElementById('cliente-id').value = clienteEncontrado.id;
    document.getElementById('cliente-nombres').value = clienteEncontrado.nombres;
    document.getElementById('cliente-telefono').value = clienteEncontrado.telefono;
    document.getElementById('cliente-correo').value = clienteEncontrado.correo;

    document.getElementById('cliente-fechaNacimiento').value = clienteEncontrado.fechaNacimiento;
    document.getElementById('cliente-edad').value = clienteEncontrado.edad;
    document.getElementById('cliente-ciudad').value = clienteEncontrado.ciudad;
    document.getElementById('cliente-sexo').value = clienteEncontrado.sexo;
    document.getElementById('cliente-estadoCivil').value = clienteEncontrado.estadoCivil;
    document.getElementById('cliente-motivoConsulta').value = clienteEncontrado.motivoConsulta;

    // Antecedentes: se marcan los checkboxes según los arrays guardados
    document.querySelectorAll('input[name="antecedente_personal[]"]').forEach(el => {
      el.checked = clienteEncontrado.antecedentesPersonal.includes(el.value);
    });
    document.querySelectorAll('input[name="antecedente_familiar[]"]').forEach(el => {
      el.checked = clienteEncontrado.antecedentesFamiliar.includes(el.value);
    });

    document.getElementById('cliente-examenClinico').value = clienteEncontrado.examenClinico;
    document.getElementById('cliente-odontograma').value = clienteEncontrado.odontograma;
    document.getElementById('cliente-diagnostico').value = clienteEncontrado.diagnostico;
    document.getElementById('cliente-planTratamiento').value = clienteEncontrado.planTratamiento;

    alert("cliente encontrado");
  } else {
    alert("cliente no encontrado");
  }
}
// Modificar cliente existente
function modificarCliente() {
  const id = document.getElementById('cliente-id').value.trim();
  const index = clientes.findIndex(p => p.id === id);
  if (index === -1) {
    alert("Cliente no encontrado para modificar");
    clientes[index].nombres = document.getElementById('cliente-nombres').value.trim();
    return;
  }
  clientes[index].telefono = document.getElementById('cliente-telefono').value.trim();
  clientes[index].correo = document.getElementById('cliente-correo').value.trim();

  clientes[index].fechaNacimiento = document.getElementById('cliente-fechaNacimiento').value.trim();
  clientes[index].edad = document.getElementById('cliente-edad').value.trim();
  clientes[index].ciudad = document.getElementById('cliente-ciudad').value.trim();
  clientes[index].sexo = document.getElementById('cliente-sexo').value;
  clientes[index].estadoCivil = document.getElementById('cliente-estadoCivil').value;
  clientes[index].motivoConsulta = document.getElementById('cliente-motivoConsulta').value.trim();

  clientes[index].antecedentesPersonal = Array.from(document.querySelectorAll('input[name="antecedente_personal[]"]:checked')).map(el => el.value);
  clientes[index].antecedentesFamiliar = Array.from(document.querySelectorAll('input[name="antecedente_familiar[]"]:checked')).map(el => el.value);

  clientes[index].examenClinico = document.getElementById('cliente-examenClinico').value.trim();
  clientes[index].odontograma = document.getElementById('cliente-odontograma').value.trim();
  clientes[index].diagnostico = document.getElementById('cliente-diagnostico').value.trim();
  clientes[index].planTratamiento = document.getElementById('cliente-planTratamiento').value.trim();

  guardarClientes();
  alert("cliente modificado exitosamente");
}
// Eliminar cliente
function eliminarCliente() {
  const id = document.getElementById('cliente-id').value.trim();
  const index = cliente.findIndex(p => p.id === id);
  if (index === -1) {
    alert("cliente no encontrado para eliminar");
    return;
  }
  if (confirm("¿Está seguro de eliminar este cliente?")) {
    Clientes.splice(index, 1);
    guardarCLientes();
    alert("Cliente eliminado exitosamente");
    document.getElementById('form-clientes').reset();
  }
}

/* REGISTRO/EDICIÓN DE MANICURISTAS */
document.getElementById('form-manicuristas').addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('manicurista-id').value.trim();
  const nombres = document.getElementById('manicurista-nombres').value.trim();
  const telefono = document.getElementById('manicurista-telefono').value.trim();
  const correo = document.getElementById('manicurista-correo').value.trim();
  const especialidad = document.getElementById('manicurista-especialidad').value.trim();

  const disponibilidad = {
    semana1: {
      lunes: { inicio: document.getElementById('disp-sem1-lunes-inicio').value, fin: document.getElementById('disp-sem1-lunes-fin').value },
      martes: { inicio: document.getElementById('disp-sem1-martes-inicio').value, fin: document.getElementById('disp-sem1-martes-fin').value },
      miercoles: { inicio: document.getElementById('disp-sem1-miercoles-inicio').value, fin: document.getElementById('disp-sem1-miercoles-fin').value },
      jueves: { inicio: document.getElementById('disp-sem1-jueves-inicio').value, fin: document.getElementById('disp-sem1-jueves-fin').value },
      viernes: { inicio: document.getElementById('disp-sem1-viernes-inicio').value, fin: document.getElementById('disp-sem1-viernes-fin').value },
      sabado: { inicio: document.getElementById('disp-sem1-sabado-inicio').value, fin: document.getElementById('disp-sem1-sabado-fin').value },
      domingo: { inicio: document.getElementById('disp-sem1-domingo-inicio').value, fin: document.getElementById('disp-sem1-domingo-fin').value }
    },
    semana2: {
      lunes: { inicio: document.getElementById('disp-sem2-lunes-inicio').value, fin: document.getElementById('disp-sem2-lunes-fin').value },
      martes: { inicio: document.getElementById('disp-sem2-martes-inicio').value, fin: document.getElementById('disp-sem2-martes-fin').value },
      miercoles: { inicio: document.getElementById('disp-sem2-miercoles-inicio').value, fin: document.getElementById('disp-sem2-miercoles-fin').value },
      jueves: { inicio: document.getElementById('disp-sem2-jueves-inicio').value, fin: document.getElementById('disp-sem2-jueves-fin').value },
      viernes: { inicio: document.getElementById('disp-sem2-viernes-inicio').value, fin: document.getElementById('disp-sem2-viernes-fin').value },
      sabado: { inicio: document.getElementById('disp-sem2-sabado-inicio').value, fin: document.getElementById('disp-sem2-sabado-fin').value },
      domingo: { inicio: document.getElementById('disp-sem2-domingo-inicio').value, fin: document.getElementById('disp-sem2-domingo-fin').value }
    },
    semana3: {
      lunes: { inicio: document.getElementById('disp-sem3-lunes-inicio').value, fin: document.getElementById('disp-sem3-lunes-fin').value },
      martes: { inicio: document.getElementById('disp-sem3-martes-inicio').value, fin: document.getElementById('disp-sem3-martes-fin').value },
      miercoles: { inicio: document.getElementById('disp-sem3-miercoles-inicio').value, fin: document.getElementById('disp-sem3-miercoles-fin').value },
      jueves: { inicio: document.getElementById('disp-sem3-jueves-inicio').value, fin: document.getElementById('disp-sem3-jueves-fin').value },
      viernes: { inicio: document.getElementById('disp-sem3-viernes-inicio').value, fin: document.getElementById('disp-sem3-viernes-fin').value },
      sabado: { inicio: document.getElementById('disp-sem3-sabado-inicio').value, fin: document.getElementById('disp-sem3-sabado-fin').value },
      domingo: { inicio: document.getElementById('disp-sem3-domingo-inicio').value, fin: document.getElementById('disp-sem3-domingo-fin').value }
    },
    semana4: {
      lunes: { inicio: document.getElementById('disp-sem4-lunes-inicio').value, fin: document.getElementById('disp-sem4-lunes-fin').value },
      martes: { inicio: document.getElementById('disp-sem4-martes-inicio').value, fin: document.getElementById('disp-sem4-martes-fin').value },
      miercoles: { inicio: document.getElementById('disp-sem4-miercoles-inicio').value, fin: document.getElementById('disp-sem4-miercoles-fin').value },
      jueves: { inicio: document.getElementById('disp-sem4-jueves-inicio').value, fin: document.getElementById('disp-sem4-jueves-fin').value },
      viernes: { inicio: document.getElementById('disp-sem4-viernes-inicio').value, fin: document.getElementById('disp-sem4-viernes-fin').value },
      sabado: { inicio: document.getElementById('disp-sem4-sabado-inicio').value, fin: document.getElementById('disp-sem4-sabado-fin').value },
      domingo: { inicio: document.getElementById('disp-sem4-domingo-inicio').value, fin: document.getElementById('disp-sem4-domingo-fin').value }
    }
  };

  if (id && nombres && telefono && correo && especialidad) {
    const index = document.getElementById('manicurista-index').value;
    if (index && Number(index) >= 0) {
      manicuristas[Number(index)] = { id, nombres, telefono, correo, especialidad, disponibilidad };
      alert('Manicurista actualizado exitosamente');
      document.getElementById('manicurista-index').value = -1;
    } else {
      manicuristas.push({ id, nombres, telefono, correo, especialidad, disponibilidad });
      alert('Manicurista registrado exitosamente');
    }
    this.reset();
    actualizarTablaManicuristas();
  }
});

/* Actualizar tabla de manicuristas */
function actualizarTablaManicuristas() {
  const tbody = document.querySelector('#tabla-manicuristas tbody');
  tbody.innerHTML = '';
  manicuristas.forEach((o, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.nombres}</td>
      <td>${o.especialidad}</td>
      <td><button onclick="editarmanicurista(${index})">Editar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

/* Buscar manicurista */
function buscarManicurista() {
  const busqueda = document.getElementById('buscar-manicurista').value.trim().toLowerCase();
  const tbody = document.querySelector('#tabla-manicurista tbody');
  tbody.innerHTML = '';
  const resultados = manicuristas.filter(o =>
    o.id.toLowerCase().includes(busqueda) || o.nombres.toLowerCase().includes(busqueda)
  );
  resultados.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.nombres}</td>
      <td>${o.especialidad}</td>
      <td><button onclick="editarManicurista(${manicuristas.indexOf(o)})">Editar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

/* Editar manicurista */
function editarManicurista(index) {
  const o = manicuristas[index];
  document.getElementById('manicurista-index').value = index;
  document.getElementById('manicurista-id').value = o.id;
  document.getElementById('manicurista-nombres').value = o.nombres;
  document.getElementById('manicurista-telefono').value = o.telefono;
  document.getElementById('manicurista-correo').value = o.correo;
  document.getElementById('manicurista-especialidad').value = o.especialidad;

  // Cargar disponibilidad para cada semana
  document.getElementById('disp-sem1-lunes-inicio').value = o.disponibilidad.semana1.lunes.inicio;
  document.getElementById('disp-sem1-lunes-fin').value = o.disponibilidad.semana1.lunes.fin;
  document.getElementById('disp-sem1-martes-inicio').value = o.disponibilidad.semana1.martes.inicio;
  document.getElementById('disp-sem1-martes-fin').value = o.disponibilidad.semana1.martes.fin;
  document.getElementById('disp-sem1-miercoles-inicio').value = o.disponibilidad.semana1.miercoles.inicio;
  document.getElementById('disp-sem1-miercoles-fin').value = o.disponibilidad.semana1.miercoles.fin;
  document.getElementById('disp-sem1-jueves-inicio').value = o.disponibilidad.semana1.jueves.inicio;
  document.getElementById('disp-sem1-jueves-fin').value = o.disponibilidad.semana1.jueves.fin;
  document.getElementById('disp-sem1-viernes-inicio').value = o.disponibilidad.semana1.viernes.inicio;
  document.getElementById('disp-sem1-viernes-fin').value = o.disponibilidad.semana1.viernes.fin;
  document.getElementById('disp-sem1-sabado-inicio').value = o.disponibilidad.semana1.sabado.inicio;
  document.getElementById('disp-sem1-sabado-fin').value = o.disponibilidad.semana1.sabado.fin;
  document.getElementById('disp-sem1-domingo-inicio').value = o.disponibilidad.semana1.domingo.inicio;
  document.getElementById('disp-sem1-domingo-fin').value = o.disponibilidad.semana1.domingo.fin;

  document.getElementById('disp-sem2-lunes-inicio').value = o.disponibilidad.semana2.lunes.inicio;
  document.getElementById('disp-sem2-lunes-fin').value = o.disponibilidad.semana2.lunes.fin;
  document.getElementById('disp-sem2-martes-inicio').value = o.disponibilidad.semana2.martes.inicio;
  document.getElementById('disp-sem2-martes-fin').value = o.disponibilidad.semana2.martes.fin;
  document.getElementById('disp-sem2-miercoles-inicio').value = o.disponibilidad.semana2.miercoles.inicio;
  document.getElementById('disp-sem2-miercoles-fin').value = o.disponibilidad.semana2.miercoles.fin;
  document.getElementById('disp-sem2-jueves-inicio').value = o.disponibilidad.semana2.jueves.inicio;
  document.getElementById('disp-sem2-jueves-fin').value = o.disponibilidad.semana2.jueves.fin;
  document.getElementById('disp-sem2-viernes-inicio').value = o.disponibilidad.semana2.viernes.inicio;
  document.getElementById('disp-sem2-viernes-fin').value = o.disponibilidad.semana2.viernes.fin;
  document.getElementById('disp-sem2-sabado-inicio').value = o.disponibilidad.semana2.sabado.inicio;
  document.getElementById('disp-sem2-sabado-fin').value = o.disponibilidad.semana2.sabado.fin;
  document.getElementById('disp-sem2-domingo-inicio').value = o.disponibilidad.semana2.domingo.inicio;
  document.getElementById('disp-sem2-domingo-fin').value = o.disponibilidad.semana2.domingo.fin;

  document.getElementById('disp-sem3-lunes-inicio').value = o.disponibilidad.semana3.lunes.inicio;
  document.getElementById('disp-sem3-lunes-fin').value = o.disponibilidad.semana3.lunes.fin;
  document.getElementById('disp-sem3-martes-inicio').value = o.disponibilidad.semana3.martes.inicio;
  document.getElementById('disp-sem3-martes-fin').value = o.disponibilidad.semana3.martes.fin;
  document.getElementById('disp-sem3-miercoles-inicio').value = o.disponibilidad.semana3.miercoles.inicio;
  document.getElementById('disp-sem3-miercoles-fin').value = o.disponibilidad.semana3.miercoles.fin;
  document.getElementById('disp-sem3-jueves-inicio').value = o.disponibilidad.semana3.jueves.inicio;
  document.getElementById('disp-sem3-jueves-fin').value = o.disponibilidad.semana3.jueves.fin;
  document.getElementById('disp-sem3-viernes-inicio').value = o.disponibilidad.semana3.viernes.inicio;
  document.getElementById('disp-sem3-viernes-fin').value = o.disponibilidad.semana3.viernes.fin;
  document.getElementById('disp-sem3-sabado-inicio').value = o.disponibilidad.semana3.sabado.inicio;
  document.getElementById('disp-sem3-sabado-fin').value = o.disponibilidad.semana3.sabado.fin;
  document.getElementById('disp-sem3-domingo-inicio').value = o.disponibilidad.semana3.domingo.inicio;
  document.getElementById('disp-sem3-domingo-fin').value = o.disponibilidad.semana3.domingo.fin;

  document.getElementById('disp-sem4-lunes-inicio').value = o.disponibilidad.semana4.lunes.inicio;
  document.getElementById('disp-sem4-lunes-fin').value = o.disponibilidad.semana4.lunes.fin;
  document.getElementById('disp-sem4-martes-inicio').value = o.disponibilidad.semana4.martes.inicio;
  document.getElementById('disp-sem4-martes-fin').value = o.disponibilidad.semana4.martes.fin;
  document.getElementById('disp-sem4-miercoles-inicio').value = o.disponibilidad.semana4.miercoles.inicio;
  document.getElementById('disp-sem4-miercoles-fin').value = o.disponibilidad.semana4.miercoles.fin;
  document.getElementById('disp-sem4-jueves-inicio').value = o.disponibilidad.semana4.jueves.inicio;
  document.getElementById('disp-sem4-jueves-fin').value = o.disponibilidad.semana4.jueves.fin;
  document.getElementById('disp-sem4-viernes-inicio').value = o.disponibilidad.semana4.viernes.inicio;
  document.getElementById('disp-sem4-viernes-fin').value = o.disponibilidad.semana4.viernes.fin;
  document.getElementById('disp-sem4-sabado-inicio').value = o.disponibilidad.semana4.sabado.inicio;
  document.getElementById('disp-sem4-sabado-fin').value = o.disponibilidad.semana4.sabado.fin;
  document.getElementById('disp-sem4-domingo-inicio').value = o.disponibilidad.semana4.domingo.inicio;
  document.getElementById('disp-sem4-domingo-fin').value = o.disponibilidad.semana4.domingo.fin;

  alert('Edite los datos del odontólogo y guarde los cambios.');
}

/* AGENDAMIENTO DE CITAS */
document.getElementById('form-agendamiento').addEventListener('submit', function (e) {
  e.preventDefault();
  const clienteIndex = document.getElementById('select-cliente').value;
  const manicuristaIndex = document.getElementById('select-manicurista').value;
  const tratamientoIndex = document.getElementById('select-tratamiento').value;
  const fecha = document.getElementById('cita-fecha').value;
  const hora = document.getElementById('cita-hora').value;

  if (pacienteIndex === "" || odontologoIndex === "" || tratamientoIndex === "" || !fecha || !hora) {
    alert('Por favor, complete todos los campos');
    return;
  }

  const fechaDate = new Date(fecha + "T00:00:00");
  const today = new Date(new Date().toISOString().split('T')[0] + "T00:00:00");
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 1);
  if (fechaDate < today || fechaDate > maxDate) {
    alert("La fecha de la cita debe estar dentro de un mes a partir de hoy");
    return;
  }

  const [year, month] = fecha.split('-').map(Number);
  const firstDayOfMonth = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00`);
  const offset = (firstDayOfMonth.getDay() + 6) % 7;
  const weekNumber = Math.floor((fechaDate.getDate() + offset - 1) / 7) + 1;
  const weekKey = "semana" + weekNumber;

  const realDay = fechaDate.getDay();
  const dayIndex = (realDay + 6) % 7;
  const dayNames = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  const diaSemana = dayNames[dayIndex];

  const manicurista = manicuristas[manicuristaIndex];
  const disponibilidad = manicurista.disponibilidad;

  if (!disponibilidad[weekKey] || !disponibilidad[weekKey][diaSemana] ||
    !disponibilidad[weekKey][diaSemana].inicio || !disponibilidad[weekKey][diaSemana].fin) {
    alert(`La manicurista no tiene disponibilidad para la ${weekKey} en ${diaSemana}`);
    return;
  }
  if (hora < disponibilidad[weekKey][diaSemana].inicio || hora >= disponibilidad[weekKey][diaSemana].fin) {
    alert(`La manicurista está disponible el ${diaSemana} de ${disponibilidad[weekKey][diaSemana].inicio} a ${disponibilidad[weekKey][diaSemana].fin} en la ${weekKey}`);
    return;
  }

  const citaExistente = citas.find(c =>
    c.manicurista.id === manicurista.id && c.fecha === fecha && c.hora === hora
  );
  if (citaExistente) {
    alert('La manicurista ya tiene una cita a esa hora');
    return;
  }

  const paciente = pacientes[pacienteIndex];
  const tratamiento = tratamientos[tratamientoIndex];

  citas.push({
    cliente,
    manicurista,
    tratamiento,
    fecha,
    hora,
    cumplida: false,
    pagada: false,
    valorPagado: 0
  });
  alert('Cita agendada exitosamente');
  this.reset();
});

/* CARGAR CITAS EN LA TABLA */
function cargarCitas() {
  const tbody = document.querySelector('#tabla-citas tbody');
  tbody.innerHTML = '';
  let total = 0;

  citas.forEach((cita, index) => {
    if (filtro.nombreCliente && !cita.cliente.nombres.toLowerCase().includes(filtro.nombreCliente.toLowerCase())) return;
    if (filtro.nombreManicurista && !cita.manicurista.nombres.toLowerCase().includes(filtro.nombreManicurista.toLowerCase())) return;
    if (filtro.id && !cita.cliente.id.includes(filtro.id)) return;
    if (filtro.mes && !cita.fecha.startsWith(filtro.mes)) return;
    if (filtro.dia && cita.fecha !== filtro.dia) return;

    total += Number(cita.valorPagado);

    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td>${cita.cliente.nombres}</td>
       <td>${cita.manicurista.nombres}</td>
       <td>${cita.fecha}</td>
       <td>${cita.hora}</td>
       <td>${cita.tratamiento ? cita.tratamiento.descripcion : ''}</td>
       <td><input type="checkbox" id="cumplida-${index}" ${cita.cumplida ? 'checked' : ''}></td>
       <td><input type="checkbox" id="pagada-${index}" ${cita.pagada ? 'checked' : ''}></td>
       <td><input type="number" id="valorPagado-${index}" value="${formatNumber(cita.valorPagado)}" step="1" style="width:80px;"></td>
       <td><button onclick="actualizarEstadoCita(${index})">Actualizar</button></td>`;
    tbody.appendChild(tr);
  });

  document.getElementById('total-pagado').textContent = "Total Pagado: $" + formatNumber(total);
}

/* ACTUALIZAR ESTADO DE CITA */
function actualizarEstadoCita(index) {
  const cumplidaCheckbox = document.getElementById(`cumplida-${index}`);
  const pagadaCheckbox = document.getElementById(`pagada-${index}`);
  const valorPagadoInput = document.getElementById(`valorPagado-${index}`);

  citas[index].cumplida = cumplidaCheckbox.checked;
  citas[index].pagada = pagadaCheckbox.checked;
  const valor = parseInt(valorPagadoInput.value.replace(/,/g, ''), 10);
  citas[index].valorPagado = isNaN(valor) ? 0 : valor;

  alert('Estado de la cita actualizado');
  cargarCitas();
}

/* OBTENER CITAS FILTRADAS (para exportar) */
function getCitasFiltradas() {
  return citas.filter(cita => {
    if (filtro.nombreCliente && !cita.cliente.nombres.toLowerCase().includes(filtro.nombreCliente.toLowerCase())) return false;
    if (filtro.nombreManicurista && !cita.manicurista.nombres.toLowerCase().includes(filtro.nombreManicurista.toLowerCase())) return false;
    if (filtro.id && !cita.cliente.id.includes(filtro.id)) return false;
    if (filtro.mes && !cita.fecha.startsWith(filtro.mes)) return false;
    if (filtro.dia && cita.fecha !== filtro.dia) return false;
    return true;
  });
}

/* FILTROS */
function aplicarFiltro() {
  const nombreCliente = document.getElementById('filter-nombre').value.trim();
  const nombreManicurista = document.getElementById('filter-nombre-manicurista').value.trim();
  const id = document.getElementById('filter-id').value.trim();
  const mes = document.getElementById('filter-mes').value;
  const dia = document.getElementById('filter-dia').value;

  filtro = { nombreCliente, nombreManicurista, id, mes, dia };
  cargarCitas();
}
function limpiarFiltro() {
  document.getElementById('filter-nombre').value = '';
  document.getElementById('filter-nombre-odontologo').value = '';
  document.getElementById('filter-id').value = '';
  document.getElementById('filter-mes').value = '';
  document.getElementById('filter-dia').value = '';
  filtro = { nombrePaciente: '', nombreOdontologo: '', id: '', mes: '', dia: '' };
  cargarCitas();
}

/* EXPORTAR A PDF */
function exportarPDF() {
  const citasFiltradas = getCitasFiltradas();
  if (citasFiltradas.length === 0) {
    alert("No hay citas para exportar.");
    return;
  }
  let total = 0;
  citasFiltradas.forEach(c => { total += Number(c.valorPagado); });

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const head = [["Cliente", "Manicurista", "Fecha", "Hora", "Tratamiento", "Cumplida", "Pagada", "Valor Pagado"]];
  const body = citasFiltradas.map(cita => [
    cita.cliente.nombres,
    cita.manicurista.nombres,
    cita.fecha,
    cita.hora,
    cita.tratamiento ? cita.tratamiento.descripcion : "",
    cita.cumplida ? "Sí" : "No",
    cita.pagada ? "Sí" : "No",
    formatNumber(cita.valorPagado)
  ]);

  body.push(["", "", "", "", "", "", "Total Pagado:", formatNumber(total)]);

  doc.autoTable({ head, body });
  doc.save("citas.pdf");
}

/* EXPORTAR A EXCEL */
function exportarExcel() {
  const citasFiltradas = getCitasFiltradas();
  if (citasFiltradas.length === 0) {
    alert("No hay citas para exportar.");
    return;
  }
  let total = 0;
  citasFiltradas.forEach(c => { total += Number(c.valorPagado); });

  const data = [
    ["Cliente", "Manicurista", "Fecha", "Hora", "Tratamiento", "Cumplida", "Pagada", "Valor Pagado"]
  ];

  citasFiltradas.forEach(cita => {
    data.push([
      cita.cliente.nombres,
      cita.manicurista.nombres,
      cita.fecha,
      cita.hora,
      cita.tratamiento ? cita.tratamiento.descripcion : "",
      cita.cumplida ? "Sí" : "No",
      cita.pagada ? "Sí" : "No",
      formatNumber(cita.valorPagado)
    ]);
  });

  data.push(["", "", "", "", "", "", "Total Pagado:", formatNumber(total)]);

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Citas");
  XLSX.writeFile(wb, "citas.xlsx");
}

/* REGISTRO DE TRATAMIENTOS */
document.getElementById('form-tratamientos').addEventListener('submit', function (e) {
  e.preventDefault();
  const descripcion = document.getElementById('tratamiento-descripcion').value.trim();
  const precio = document.getElementById('tratamiento-precio').value.trim();

  if (descripcion && precio) {
    tratamientos.push({ descripcion, precio });
    alert('Tratamiento registrado exitosamente');
    actualizarListaTratamientos();
    this.reset();
  }
});
function actualizarListaTratamientos() {
  const ul = document.getElementById('lista-tratamientos');
  ul.innerHTML = '';
  tratamientos.forEach((t, index) => {
    const li = document.createElement('li');
    li.textContent = (index + 1) + '. ' + t.descripcion + ' - $' + t.precio;
    ul.appendChild(li);
  });
}

/* AL CARGAR LA PÁGINA, SE CARGAN LOS CLIENTES DESDE LOCALSTORAGE */
window.addEventListener('load', function () {
  cargarClientes();
});
