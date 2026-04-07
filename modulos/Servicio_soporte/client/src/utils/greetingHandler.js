// greetingHandler.js

const getGreetingMessage = (name) => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    let greeting;

    if (currentHour >= 5 && currentHour < 12) {
        greeting = 'Buenos Dias 😎';
    } else if (currentHour >= 12 && currentHour < 18) {
        greeting = 'Buenas Tardes 🌤️';
    } else {
        greeting = 'Buenas Noches 🌙';
    }

    return `👋 Hola ${name}, ${greeting}!`;
};

export default getGreetingMessage;
