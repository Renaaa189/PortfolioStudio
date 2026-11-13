import { useCallback, useState } from 'react';
import { ApiError } from '../api/client.js';

/**
 * Manejo de formularios con validación en el cliente y errores del servidor.
 *   const form = useForm(initial, validate);
 *   form.bind('name') -> { value, onChange, error }
 */
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const setField = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  const bind = (name) => ({
    name,
    value: values[name] ?? '',
    error: errors[name],
    onChange: (e) => setField(name, e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e),
  });

  const handleSubmit = (onSubmit) => async (e) => {
    e?.preventDefault();
    setFormError('');
    const clientErrors = validate ? validate(values) : {};
    const hasErrors = Object.values(clientErrors).some(Boolean);
    setErrors(clientErrors);
    if (hasErrors) {
      requestAnimationFrame(() => document.querySelector('.field--error input, .field--error textarea, .field--error select')?.focus());
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError && err.details && Object.keys(err.details).length) {
        setErrors(err.details);
        setFormError(err.message);
      } else {
        setFormError(err.message || 'Algo salió mal');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValues, errors, setErrors, setField, bind, handleSubmit, submitting, formError };
}
