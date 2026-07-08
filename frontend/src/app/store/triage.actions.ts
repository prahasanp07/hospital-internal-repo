import { createAction, props } from '@ngrx/store';

export interface TriageState {
    anatomicalLocation: string;
    urgencyTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN' | '';
    findings: string[];
    draftReportText: string;
    isValidated?: boolean;
    flaggedReason?: string;
    status?: string;
}

export const loadTriageEvent = createAction(
    '[Triage Stream] Receive Event',
    props<{ payload: TriageState }>()
);

export const updateTriageField = createAction(
    '[Triage Form] Update Field',
    props<{ field: keyof TriageState; value: any }>()
);
