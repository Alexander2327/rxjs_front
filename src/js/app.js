import Widget from './Widget';

// const url = 'http://localhost:9050/messages/unread/';
const url = 'https://rxjs-backend.onrender.com/messages/unread/';
const widget = new Widget(document.getElementById('root'), url);

widget.subscribe();