'use client';
import * as React from 'react';

import styles from './LibraryPage.module.scss';

import { useAuthenticatedUser } from '@/app/hooks/Queries/Auth';
import { useAllLicenses } from '@/app/hooks/Queries/License';
import Link from 'next/link';

export function LibraryPage() {
    const { data: authenticatedUser } = useAuthenticatedUser();
    const { data: licenses } = useAllLicenses();

    return authenticatedUser ? (
        <div className="main-wrapper">
            <div className={styles.library}>
                <h1>Your Library</h1>
                {licenses?.map((license) => (
                    <div className={styles.game} key={license.id}>
                        <div className={styles.thumbnail}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={license.licensed.thumbnail}
                                alt={license.licensed.title}
                            />
                        </div>
                        <div className={styles.title}>
                            {license.licensed.title}
                        </div>
                    </div>
                ))}
                {(!licenses || licenses.length < 1) && (
                    <div className={styles.nogames}>
                        <b>{`You don't own any games yet!`}</b>
                        <br />
                        <span>
                            Check out the <Link href="/">store</Link> and find
                            your first game to play!
                        </span>
                    </div>
                )}
            </div>
        </div>
    ) : (
        <></>
    );
}
