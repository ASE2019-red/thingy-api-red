export interface IConfig {
    port: number;
    prettyLog: boolean;
}

// TODO: move to JSON configuration
const config = {
    port: process.env.NODE_PORT || 3000,
    prettyLog: process.env.NODE_ENV == 'development',
    flux_hostname: process.env.FLUXDB_HOST || 'localhost',
    flux_dbname: process.env.FLUXDB_DBNAME || 'thingy-db-red',
    flux_user: process.env.FLUXDB_USER || 'fluxdb-user',
    flux_pw: process.env.FLUXDB_PW || 'mysecretpassword',
    pg_hostname: process.env.POSTGRES_HOST || 'localhost',
    pg_dbname: process.env.POSTGRES_DBNAME || 'thingy-db-red',
    pg_user: process.env.POSTGRES_USER || 'postgres',
    pg_pw: process.env.POSTGRES_PW || 'mysecretpassword',
};

export { config };
