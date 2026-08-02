import { initScrollReveal } from './features/scroll-reveal.js';

initScrollReveal('[data-reveal]');

const form = document.getElementById('contact-form');
const successPanel = document.getElementById('contact-success');
const sendAnotherBtn = document.getElementById('contact-again');
const subjectInput = document.getElementById('contact-subject');
const bodyInput = document.getElementById('contact-body');

prefillFromQuery();

form.addEventListener('submit', handleSubmit);
sendAnotherBtn.addEventListener('click', resetForm);

function prefillFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get('subject');
  const body = params.get('body');

  if (subject) {
    subjectInput.value = subject;
  }
  if (body) {
    bodyInput.value = body;
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const submitBtn = form.querySelector('.contact-form__submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });

    const result = await response.json();

    if (result.success) {
      form.hidden = true;
      successPanel.hidden = false;
    } else {
      throw new Error(result.message || 'Submission failed');
    }
  } catch (err) {
    console.error('Contact form submission failed:', err);
    alert("Sorry, something went wrong sending your message. Please try again or email us directly.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send message';
  }
}

function resetForm() {
  form.reset();
  form.hidden = false;
  successPanel.hidden = true;
}
