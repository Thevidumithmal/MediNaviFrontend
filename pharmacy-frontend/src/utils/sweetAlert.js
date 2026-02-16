import Swal from 'sweetalert2'

export const showSuccess = (message, title = 'Success!') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonColor: '#10b981',
    confirmButtonText: 'OK'
  })
}

export const showError = (message, title = 'Error!') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'OK'
  })
}

export const showConfirm = (message, title = 'Are you sure?') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel'
  })
}

export const showInfo = (message, title = 'Info') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'OK'
  })
}
