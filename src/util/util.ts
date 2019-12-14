const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export {randomInt, sleep};
