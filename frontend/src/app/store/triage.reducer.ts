import { createReducer, on } from '@ngrx/store';
import { loadTriageEvent, updateTriageField, TriageState } from './triage.actions';

export const initialState: TriageState = {
    anatomicalLocation: '',
    urgencyTier: '',
    findings: [],
    draftReportText: ''
};

export const triageReducer = createReducer(
    initialState,
    on(loadTriageEvent, (state, { payload }) => ({
        ...state,
        ...payload
    })),
    on(updateTriageField, (state, { field, value }) => ({
        ...state,
        [field]: value
    }))
);
