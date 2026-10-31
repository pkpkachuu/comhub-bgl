import React from 'react';

export const CompetitionRulesRow: React.FC = () => {
  return (
    <section id="rules" className="px-4 md:px-12 my-12">
      <div className="border-t border-neutral-800 pt-8 mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Competition & Calibration Protocol
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          The strict mathematical scoring rules governing the BITS GOT LATENT production system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#e50914] uppercase tracking-wider">
            01 · 10-Point Scale
          </div>
          <h4 className="text-base font-bold text-white">
            Strict 0.5 Increments
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Every contestant prediction and evaluator score is strictly submitted in multiples of 0.5 (e.g., 6.5, 7.0, 7.5, 8.0). Arbitrary decimal scores like 7.2 or 8.1 are mathematically rejected.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-[#e50914] uppercase tracking-wider">
            02 · 5-Evaluator Panel
          </div>
          <h4 className="text-base font-bold text-white">
            Guest Judges & ComHub
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The official panel comprises 2 guest judges (Jomedy & Priyanshu) and 3 ComHub arbiters. Each evaluator votes independently without seeing others' scores.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-[#e50914] uppercase tracking-wider">
            03 · Panel Ceiling Rounding
          </div>
          <h4 className="text-base font-bold text-white">
            Ceiled Arithmetic Mean
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Only after all 5 scores exist, their arithmetic mean is computed and rounded UP to the next 0.5: <span className="text-white font-mono text-[11px]">Math.ceil(avg * 2) / 2</span>. Individual scores are never rounded.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-[#e50914] uppercase tracking-wider">
            04 · Confidential Vault
          </div>
          <h4 className="text-base font-bold text-white">
            Zero-Trust Secrecy
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Contestants submit private predictions via unique single-use tokens. Prediction numbers are never exposed to judges, admin, or the audience until authorized on stage.
          </p>
        </div>
      </div>
    </section>
  );
};
