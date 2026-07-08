import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TriageState } from './triage.actions';

export const selectTriageState = createFeatureSelector<TriageState>('triage');

export const selectTriageData = createSelector(
    selectTriageState,
    (state: TriageState) => state
);
