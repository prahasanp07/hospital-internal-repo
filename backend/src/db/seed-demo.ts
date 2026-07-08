import { supabase } from './client';

const demoPatients = [
  {
    status: 'READY_FOR_REVIEW',
    urgency_tier: 'HIGH',
    anatomical_location: 'Chest',
    findings: ['Acute myocardial infarction', 'Elevated ST segments'],
    draft_report_text: 'Patient: Samuel Jackson. Severe chest pain. FHIR JSON: {"resourceType": "Bundle", "type": "collection", "entry": [{"resource": {"resourceType": "Patient", "name": [{"family": "Jackson", "given": ["Samuel"]}]}}]}',
    image_url: 'https://example.com/chest-xray.png',
    is_validated: false,
  },
  {
    status: 'COMPLETED',
    urgency_tier: 'LOW',
    anatomical_location: 'Right Ankle',
    findings: ['No fracture identified', 'Mild swelling'],
    draft_report_text: 'Patient: Robert Chen. Ankle sprain.',
    image_url: 'https://example.com/ankle.png',
    is_validated: true,
  },
  {
    status: 'PENDING_AI',
    urgency_tier: 'UNKNOWN',
    anatomical_location: 'Left Wrist',
    findings: [],
    draft_report_text: 'Patient: Elena Rostova. Wrist pain after fall.',
    image_url: 'https://example.com/wrist.png',
    is_validated: false,
  },
  {
    status: 'READY_FOR_REVIEW',
    urgency_tier: 'MEDIUM',
    anatomical_location: 'Head',
    findings: ['Minor concussion'],
    draft_report_text: 'Patient: Marcus Vance. Headache.',
    image_url: 'https://example.com/head.png',
    is_validated: false,
  },
  {
    status: 'COMPLETED',
    urgency_tier: 'HIGH',
    anatomical_location: 'Abdomen',
    findings: ['Appendicitis'],
    draft_report_text: 'Patient: Priya Nair. Severe abdominal pain.',
    image_url: 'https://example.com/abdomen.png',
    is_validated: true,
  },
  {
    status: 'PENDING_AI',
    urgency_tier: 'UNKNOWN',
    anatomical_location: 'Knee',
    findings: [],
    draft_report_text: 'Patient: Liam Smith. Knee pain.',
    image_url: 'https://example.com/knee.png',
    is_validated: false,
  },
  {
    status: 'READY_FOR_REVIEW',
    urgency_tier: 'LOW',
    anatomical_location: 'Hand',
    findings: ['Cut on index finger'],
    draft_report_text: 'Patient: Arthur Pendelton. Laceration.',
    image_url: 'https://example.com/hand.png',
    is_validated: false,
  },
  {
    status: 'COMPLETED',
    urgency_tier: 'MEDIUM',
    anatomical_location: 'Back',
    findings: ['Lumbar strain'],
    draft_report_text: 'Patient: Chloe Dubois. Lower back pain.',
    image_url: 'https://example.com/back.png',
    is_validated: true,
  }
];

async function main() {
  console.log('Starting DB seed...');
  
  // Wipe existing mock data from triage_jobs
  const { error: deleteError } = await supabase
    .from('triage_jobs')
    .delete()
    .not('id', 'is', null);
  
  if (deleteError) {
    console.error('Error deleting existing data:', deleteError);
    return;
  }
  console.log('Wiped existing triage_jobs data.');

  // Bulk insert
  const { error: insertError } = await supabase
    .from('triage_jobs')
    .insert(demoPatients);

  if (insertError) {
    console.error('Error inserting data:', insertError);
  } else {
    console.log(`Successfully seeded ${demoPatients.length} patient profiles.`);
  }
}

main();
