import React from 'react';
import { ViewState } from '../../types';
import { LithosHero } from '../LithosHero';

interface SectionProps {
    setView: (view: ViewState) => void;
}


export const ValparaiPresence: React.FC<SectionProps> = ({ setView }) => {
    return (
        <section className="relative w-full overflow-hidden">
            <LithosHero
                onStartDigging={() => setView(ViewState.ABOUT_VALPARAI)}
            />
        </section>
    );
};