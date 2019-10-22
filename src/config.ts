export interface IConfig {
    port: number;
    prettyLog: boolean;
}

// TODO: move to JSON configuration
const config = {
    port: process.env.NODE_PORT || 3000,
    prettyLog: process.env.NODE_ENV == 'development',
    fluxDbName: process.env.FLUXDB_NAME || 'thingy-db-red',
};

export { config };
