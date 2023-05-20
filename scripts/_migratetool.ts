import { Surreal } from '@theopensource-company/surrealdb-cloudflare';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

export type EnvironmentKey = `LEAFAL_ENV_${string}`;
export type MigrationEnvironment = {
    SURREAL_HOST: string;
    SURREAL_NAMESPACE: string;
    SURREAL_DATABASE: string;
    SURREAL_USERNAME: string;
    SURREAL_PASSWORD: string;
    LEAFAL_DEFAULT_ADMIN?: string;
    [k: EnvironmentKey]: string;
};

export const migrateDatabase = async (
    env: MigrationEnvironment,
    exit = true,
    logsEnabled = true,
    __root = ''
) => {
    try {
        const log = logsEnabled ? console.log : null;
        log?.('\nHost: ' + env.SURREAL_HOST);
        log?.('NS: ' + env.SURREAL_NAMESPACE);
        log?.('DB: ' + env.SURREAL_DATABASE);

        try {
            if (__root == '')
                __root = path.dirname(path.dirname(import.meta.url));
        } catch (_e) {
            console.log('Failed to update __root path variable');
        }

        if (__root.startsWith('file://'))
            __root = __root.slice('file://'.length);

        const dbfiles = fs
            .readdirSync(__root + '/tables')
            .filter((a) => !['.gitkeep'].includes(a));
        const emailtemplates = fs
            .readdirSync(__root + '/email_templates')
            .filter((a) => !['.gitkeep'].includes(a));

        const db = new Surreal(
            {
                host: env.SURREAL_HOST,
                username: env.SURREAL_USERNAME,
                password: env.SURREAL_PASSWORD,
                namespace: env.SURREAL_NAMESPACE,
                database: env.SURREAL_DATABASE,
            },
            fetch
        );

        log?.('\nStarting database migrations\n');

        await Promise.all(
            dbfiles.map(async (f) => {
                log?.(' - Importing file ' + f);
                const q = fs.readFileSync(__root + '/tables/' + f).toString();
                log?.(' + Executing');
                await db.query(q);
            })
        );

        log?.('\nMigrating email templates');

        await Promise.all(
            emailtemplates.map(async (f) => {
                const template = f.split('.')[0];
                log?.(' - Importing template ' + f);
                const content = fs
                    .readFileSync(__root + '/email_templates/' + f)
                    .toString();
                const query = `UPDATE email_templates:${template} SET content=${JSON.stringify(
                    content
                )}`;
                log?.(' + Executing');
                await db.query(query);
            })
        );

        const envvars = Object.keys(env).filter((k) =>
            k.toUpperCase().startsWith('LEAFAL_ENV_')
        ) as EnvironmentKey[];
        if (envvars.length > 0) {
            log?.('\nMigrating predefined environment keys');

            await Promise.all(
                envvars.map(async (envvar) => {
                    const key = envvar
                        .slice('LEAFAL_ENV_'.length)
                        .toLowerCase();
                    const query = `UPDATE environment:${key} SET value=${JSON.stringify(
                        env[envvar]
                    )}`;
                    log?.(' - Setting environment key ' + key);
                    log?.(' + Executing');
                    await db.query(query);
                })
            );
        } else {
            log?.(
                'No predefined envvars, update yourself accordingly in admin panel.'
            );
        }

        if (env.LEAFAL_DEFAULT_ADMIN) {
            log?.('\nDetected default admin credentials');

            const user = JSON.parse(env.LEAFAL_DEFAULT_ADMIN);
            if (user.name && user.email && user.password) {
                const query = `CREATE admin SET name=${JSON.stringify(
                    user.name
                )}, email=${JSON.stringify(
                    user.email
                )}, password=crypto::argon2::generate(${JSON.stringify(
                    user.password
                )})`;
                log?.(' + Executing');
                await db.query(query);
            } else {
                log?.('Invalid user object, skipping it.');
            }
        } else {
            log?.('\nNo default admin credentials were found');
        }

        log?.('\nFinished database migrations');
        if (exit) process.exit(0);
    } catch (e) {
        console.log('Could not run migration script');
        console.log(e);
    }
};
