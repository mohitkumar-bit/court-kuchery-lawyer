export type Client = {
  id: string;
  name: string;
  phone: string;
  caseType: string;
  avatar: string;
};

export type Message = {
  id: string;
  text: string;
  isFromClient: boolean;
  timestamp: string;
};

export type Conversation = {
  clientId: string;
  client: Client;
  messages: Message[];
  lastMessage: string;
  lastMessageAt: string;
};

export const DUMMY_CLIENTS: Client[] = [
  { id: '1', name: 'Rahul Verma', phone: '+91 98765 43210', caseType: 'Property Dispute', avatar: 'R' },
  { id: '2', name: 'Priya Sharma', phone: '+91 91234 56789', caseType: 'Divorce', avatar: 'P' },
  { id: '3', name: 'Vikram Singh', phone: '+91 99887 76655', caseType: 'Criminal Defense', avatar: 'V' },
  { id: '4', name: 'Anita Desai', phone: '+91 95544 33221', caseType: 'Corporate', avatar: 'A' },
];

const MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', text: 'Hello, I need help with a property dispute. My brother is claiming rights over our ancestral house.', isFromClient: true, timestamp: '2025-02-10T09:30:00' },
    { id: 'm2', text: 'Hello Rahul. I understand. Can you share the details of the property and your relationship with your brother?', isFromClient: false, timestamp: '2025-02-10T09:45:00' },
    { id: 'm3', text: 'Sure. The house is in Delhi. My father passed away last year. We are 3 siblings - me, my brother and sister.', isFromClient: true, timestamp: '2025-02-10T10:00:00' },
    { id: 'm4', text: 'Thank you. Was there a will? And has your sister taken any position on this?', isFromClient: false, timestamp: '2025-02-10T10:15:00' },
    { id: 'm5', text: 'No will. My sister wants to sell and divide. My brother wants to live there and says we have no rights.', isFromClient: true, timestamp: '2025-02-10T10:30:00' },
    { id: 'm6', text: 'Under Hindu Succession Act, all three of you have equal rights. We can schedule a consultation to discuss next steps.', isFromClient: false, timestamp: '2025-02-10T11:00:00' },
  ],
  '2': [
    { id: 'm7', text: 'Hi, I want to file for divorce. My husband and I have been separated for 2 years.', isFromClient: true, timestamp: '2025-02-11T14:00:00' },
    { id: 'm8', text: 'Hello Priya. I’m sorry to hear that. Do you have mutual consent or are you considering a contested divorce?', isFromClient: false, timestamp: '2025-02-11T14:20:00' },
    { id: 'm9', text: 'We tried mutual consent but he backed out. I want to proceed with contested divorce now.', isFromClient: true, timestamp: '2025-02-11T14:35:00' },
    { id: 'm10', text: 'I understand. We’ll need grounds like cruelty or desertion. Do you have any documentation – emails, messages, evidence of separation?', isFromClient: false, timestamp: '2025-02-11T14:50:00' },
    { id: 'm11', text: 'Yes I have screenshots and our rent agreement showing separate addresses. When can we meet?', isFromClient: true, timestamp: '2025-02-11T15:10:00' },
    { id: 'm12', text: 'I have a slot tomorrow at 4 PM. I’ll send you the consultation link.', isFromClient: false, timestamp: '2025-02-11T15:30:00' },
  ],
  '3': [
    { id: 'm13', text: 'Advocate, I have been falsely implicated in a theft case. I need urgent help.', isFromClient: true, timestamp: '2025-02-12T08:00:00' },
    { id: 'm14', text: 'Vikram, please share the basics – when were you arrested, which police station, and what is the charge?', isFromClient: false, timestamp: '2025-02-12T08:15:00' },
    { id: 'm15', text: 'Yesterday evening. Saket police station. They say I stole from a shop but I was at home with my family.', isFromClient: true, timestamp: '2025-02-12T08:25:00' },
    { id: 'm16', text: 'Have you been granted bail? Do you have any alibi witnesses – family members who can testify?', isFromClient: false, timestamp: '2025-02-12T08:40:00' },
    { id: 'm17', text: 'No bail yet. My wife and neighbour were with me. I can get their statements.', isFromClient: true, timestamp: '2025-02-12T08:55:00' },
    { id: 'm18', text: 'I’ll reach the court today. Don’t make any statement to police without me. I’ll call you in an hour.', isFromClient: false, timestamp: '2025-02-12T09:10:00' },
  ],
  '4': [
    { id: 'm19', text: 'Good morning. Our company is facing a contract dispute with a vendor. Need legal advice.', isFromClient: true, timestamp: '2025-02-12T11:00:00' },
    { id: 'm20', text: 'Good morning Anita. What is the nature of the dispute – non-payment, breach of terms, or something else?', isFromClient: false, timestamp: '2025-02-12T11:15:00' },
    { id: 'm21', text: 'They delivered defective goods. We have a clause for quality checks. We want to terminate and recover advance.', isFromClient: true, timestamp: '2025-02-12T11:30:00' },
    { id: 'm22', text: 'Do you have the contract copy, proof of defect, and any communication with the vendor?', isFromClient: false, timestamp: '2025-02-12T11:45:00' },
    { id: 'm23', text: 'Yes, we have everything. Can we have a meeting this week?', isFromClient: true, timestamp: '2025-02-12T12:00:00' },
    { id: 'm24', text: 'Thursday 3 PM works. I’ll send a calendar invite. Please share the contract and evidence beforehand.', isFromClient: false, timestamp: '2025-02-12T12:15:00' },
  ],
};

export function getConversations(): Conversation[] {
  return DUMMY_CLIENTS.map((client) => {
    const messages = MESSAGES[client.id] || [];
    const lastMsg = messages[messages.length - 1];
    return {
      clientId: client.id,
      client,
      messages,
      lastMessage: lastMsg?.text || 'No messages',
      lastMessageAt: lastMsg?.timestamp || '',
    };
  });
}

export function getConversationByClientId(clientId: string): Conversation | undefined {
  const client = DUMMY_CLIENTS.find((c) => c.id === clientId);
  if (!client) return undefined;
  const messages = MESSAGES[clientId] || [];
  const lastMsg = messages[messages.length - 1];
  return {
    clientId: client.id,
    client,
    messages,
    lastMessage: lastMsg?.text || 'No messages',
    lastMessageAt: lastMsg?.timestamp || '',
  };
}
