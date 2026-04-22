export type CaseStatus = 'active' | 'pending' | 'closed';

export type Case = {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  caseType: string;
  caseTitle: string;
  status: CaseStatus;
  openedAt: string;
  nextHearing?: string;
  description: string;
};

export const DUMMY_CASES: Case[] = [
  {
    id: 'c1',
    clientId: '1',
    clientName: 'Rahul Verma',
    clientAvatar: 'R',
    caseType: 'Property Dispute',
    caseTitle: 'Ancestral Property - Partition',
    status: 'active',
    openedAt: '2025-02-10',
    nextHearing: '2025-03-15',
    description: 'Partition suit for ancestral house in Delhi. Three siblings, no will. Brother claiming exclusive rights.',
  },
  {
    id: 'c2',
    clientId: '2',
    clientName: 'Priya Sharma',
    clientAvatar: 'P',
    caseType: 'Divorce',
    caseTitle: 'Contested Divorce Petition',
    status: 'active',
    openedAt: '2025-02-11',
    nextHearing: '2025-02-20',
    description: 'Contested divorce on grounds of cruelty and desertion. Client separated 2 years, has evidence.',
  },
  {
    id: 'c3',
    clientId: '3',
    clientName: 'Vikram Singh',
    clientAvatar: 'V',
    caseType: 'Criminal Defense',
    caseTitle: 'Theft Case - Saket PS',
    status: 'active',
    openedAt: '2025-02-12',
    nextHearing: '2025-02-18',
    description: 'False implication in shop theft. Client has alibi - wife and neighbour. Bail pending.',
  },
  {
    id: 'c4',
    clientId: '4',
    clientName: 'Anita Desai',
    clientAvatar: 'A',
    caseType: 'Corporate',
    caseTitle: 'Vendor Contract Dispute',
    status: 'pending',
    openedAt: '2025-02-12',
    description: 'Contract termination and recovery of advance. Vendor delivered defective goods. Meeting scheduled.',
  },
  {
    id: 'c5',
    clientId: '1',
    clientName: 'Rahul Verma',
    clientAvatar: 'R',
    caseType: 'Property Dispute',
    caseTitle: 'Rental Agreement - Landlord Dispute',
    status: 'closed',
    openedAt: '2024-11-05',
    description: 'Resolved: Landlord eviction notice challenged. Settlement reached.',
  },
];

export function getCasesByStatus(status: CaseStatus): Case[] {
  return DUMMY_CASES.filter((c) => c.status === status);
}

export function getActiveCasesCount(): number {
  return DUMMY_CASES.filter((c) => c.status === 'active').length;
}
