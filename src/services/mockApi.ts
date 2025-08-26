import { 
  ApiResponse, 
  User, 
  UserHistory, 
  Account, 
  AccountCharge, 
  AccountInvoice,
  Survey,
  Poll,
  Collector,
  Payment,
  SystemEvent,
  DashboardStats,
  PaginatedResponse,
  PaginationParams,
  FilterParams
} from '../types';

// Mock Data Generation
const generateMockUsers = (): User[] => {
  const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia', 'Japan', 'Brazil'];
  const providers = ['Google', 'Facebook', 'LinkedIn', 'Email', 'Twitter'];
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Robert', 'Amanda', 'James', 'Jessica'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White'];
  
  // Add glassfox admin as the first user to match your JSP response
  const users: User[] = [];
  
  // Add the glassfox admin user based on your JSP response
  users.push({
    // Original API fields
    userId: 1,
    userName: 'glassfox',
    email: 'alex@inqwise.com',
    displayName: 'glassfox admin',
    firstName: 'Alex',
    lastName: 'Admin',
    countryId: 232,
    countryName: 'United States',
    countryCode: 'US',
    provider: 'Email',
    isActive: true,
    insertDate: 'Aug 13, 2025 00:00:00',
    lastLoginDate: 'Aug 13, 2025 10:30:00',
    clientIp: '127.0.0.1',
    sendNewsLetters: false,
    // Additional fields for admin UI
    id: '1',
    username: 'glassfox',
    fullName: 'glassfox admin',
    phone: '+1-234-567-8900',
    role: 'admin',
    status: 'active',
    avatar: undefined,
    locale: 'en-US',
    timezone: 'UTC',
    emailVerified: true,
    mfaEnabled: true,
    tags: ['admin', 'test'],
    companyName: 'InqWise',
    planName: 'Enterprise',
    createdAt: 'Aug 13, 2025 00:00:00',
    updatedAt: 'Aug 13, 2025 00:00:00',
    lastLoginAt: 'Aug 13, 2025 10:30:00'
  });
  
  // Generate additional mock users
  for (let i = 1; i < 150; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
    const isActive = Math.random() > 0.2;
    const createdDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const formattedDate = createdDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }) + ' ' + createdDate.toLocaleTimeString('en-US');
    
    users.push({
      // Original API fields
      userId: i + 1,
      userName: `user${i + 1}`,
      email: `${username}@example.com`,
      displayName: fullName,
      firstName,
      lastName,
      countryId: [232, 39, 230, 232, 39, 230, 232, 39][i % 8],
      countryName: countries[i % countries.length],
      countryCode: ['US', 'GB', 'CA', 'DE', 'FR', 'AU', 'JP', 'BR'][i % countries.length],
      provider: providers[i % providers.length],
      isActive,
      insertDate: formattedDate,
      lastLoginDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) + ' ' + new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleTimeString('en-US') : undefined,
      clientIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
      sendNewsLetters: Math.random() > 0.5,
      // Additional fields for admin UI
      id: (i + 1).toString(),
      username,
      fullName,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      role: Math.random() > 0.9 ? 'admin' : Math.random() > 0.7 ? 'moderator' : 'user',
      status: isActive ? 'active' : (Math.random() > 0.5 ? 'disabled' : 'pending'),
      avatar: undefined,
      locale: 'en-US',
      timezone: 'UTC',
      emailVerified: Math.random() > 0.2,
      mfaEnabled: Math.random() > 0.8,
      tags: Math.random() > 0.5 ? ['user', 'test'] : undefined,
      companyName: Math.random() > 0.6 ? `Company ${i + 1}` : undefined,
      planName: ['Free', 'Basic', 'Pro', 'Enterprise'][Math.floor(Math.random() * 4)],
      createdAt: formattedDate,
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) + ' ' + new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleTimeString('en-US'),
      lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) + ' ' + new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleTimeString('en-US') : undefined
    });
  }
  
  return users;
};

const generateAccountUsers = (accountId: number): User[] => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Robert', 'Amanda'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  const roles = ['admin', 'moderator', 'user'];
  const statuses = ['active', 'inactive', 'pending'];
  
  // Generate 3-8 users per account
  const userCount = Math.floor(Math.random() * 6) + 3;
  
  return Array.from({ length: userCount }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${accountId}_${i + 1}`;
    const isActive = Math.random() > 0.2;
    const createdDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const formattedDate = createdDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }) + ' ' + createdDate.toLocaleTimeString('en-US');
    
    return {
      // Original API fields
      userId: 1000 + (accountId * 10) + i + 1, // Unique user ID
      userName: username,
      email: `${username}@account${accountId}.com`,
      displayName: fullName,
      firstName,
      lastName,
      countryId: 232,
      countryName: 'United States',
      countryCode: 'US',
      provider: 'Email',
      isActive,
      insertDate: formattedDate,
      lastLoginDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) + ' ' + new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleTimeString('en-US') : undefined,
      clientIp: `192.168.${accountId}.${Math.floor(Math.random() * 255)}`,
      sendNewsLetters: Math.random() > 0.5,
      // Additional fields for admin UI
      id: (1000 + (accountId * 10) + i + 1).toString(),
      username,
      fullName,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      role: i === 0 ? 'admin' : roles[Math.floor(Math.random() * roles.length)] as 'admin' | 'moderator' | 'user',
      status: isActive ? 'active' : statuses[Math.floor(Math.random() * statuses.length)] as 'active' | 'inactive' | 'pending',
      avatar: undefined,
      locale: 'en-US',
      timezone: 'UTC',
      emailVerified: Math.random() > 0.2,
      mfaEnabled: Math.random() > 0.8,
      tags: Math.random() > 0.5 ? [`account-${accountId}`, 'team'] : undefined,
      companyName: `Account ${accountId} Company`,
      planName: ['Basic', 'Pro', 'Enterprise'][Math.floor(Math.random() * 3)],
      createdAt: formattedDate,
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) + ' ' + new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleTimeString('en-US'),
      lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) + ' ' + new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleTimeString('en-US') : undefined
    };
  });
};

const generateMockUserHistory = (): UserHistory[] => {
  const types = [
    { id: 1, name: 'Login' },
    { id: 2, name: 'Logout' },
    { id: 3, name: 'Survey Created' },
    { id: 4, name: 'Survey Updated' },
    { id: 5, name: 'Poll Created' },
    { id: 6, name: 'Account Updated' },
  ];
  
  return Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    userId: Math.floor(Math.random() * 150) + 1,
    userName: `user${Math.floor(Math.random() * 150) + 1}`,
    typeId: types[Math.floor(Math.random() * types.length)].id,
    typeName: types[Math.floor(Math.random() * types.length)].name,
    countryName: ['United States', 'United Kingdom', 'Canada', 'Germany'][Math.floor(Math.random() * 4)],
    clientIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
    insertDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const generateMockAccounts = (): Account[] => {
  const servicePackageNames = ['Basic', 'Professional', 'Enterprise', 'Premium'];
  const statuses: Array<'enabled' | 'disabled' | 'expired' | 'suspended'> = ['enabled', 'disabled', 'expired', 'suspended'];
  const companyNames = [
    'Acme Corporation', 'Global Dynamics', 'TechCorp Solutions', 'Innovation Labs',
    'DataStream Inc', 'CloudVision Ltd', 'NextGen Systems', 'DigitalEdge Corp',
    'SmartWave Technologies', 'FutureLink Partners'
  ];
  
  return Array.from({ length: 50 }, (_, i) => {
    const isActive = Math.random() > 0.15;
    const status = isActive ? 
      (Math.random() > 0.1 ? 'enabled' : statuses[Math.floor(Math.random() * statuses.length)]) : 
      'disabled';
    
    return {
      accountId: i + 1,
      accountName: `Account ${i + 1}`,
      ownerId: Math.random() > 0.3 ? Math.floor(Math.random() * 150) + 1 : undefined,
      ownerUserName: Math.random() > 0.3 ? `user${Math.floor(Math.random() * 150) + 1}` : undefined,
      servicePackageName: servicePackageNames[Math.floor(Math.random() * servicePackageNames.length)],
      packageId: Math.floor(Math.random() * 4) + 1,
      timezoneId: Math.floor(Math.random() * 5) + 1,
      timezone: ['UTC', 'EST (UTC-5)', 'PST (UTC-8)', 'CET (UTC+1)', 'JST (UTC+9)'][Math.floor(Math.random() * 5)],
      isActive,
      status,
      insertDate: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000).toISOString(),
      planExpirationDate: Math.random() > 0.4 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      remainingResponses: Math.floor(Math.random() * 5000) + 500,
      permissions: Math.random() > 0.5 ? 
        ['CREATE_SURVEYS', 'VIEW_REPORTS', 'EXPORT_DATA'].filter(() => Math.random() > 0.3) : 
        ['CREATE_SURVEYS', 'EDIT_SURVEYS', 'DELETE_SURVEYS', 'VIEW_REPORTS', 'EXPORT_DATA', 'MANAGE_USERS'].filter(() => Math.random() > 0.4),
      inheritPermissions: Math.random() > 0.7,
      // Additional fields for the admin UI
      id: i + 1,
      companyName: companyNames[i % companyNames.length],
      contactEmail: `contact${i + 1}@${companyNames[i % companyNames.length].toLowerCase().replace(/\s+/g, '')}.com`,
      contactName: `Contact Person ${i + 1}`,
      lastActivityDate: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      totalUsers: Math.floor(Math.random() * 100) + 1,
      totalSurveys: Math.floor(Math.random() * 20) + 1,
      totalResponses: Math.floor(Math.random() * 1000) + 100,
      // Add sample users for each account
      users: generateAccountUsers(i + 1),
    };
  });
};

const generateMockSurveys = (): Survey[] => {
  const statuses: Array<'draft' | 'active' | 'paused' | 'completed' | 'archived' | 'closed'> = ['draft', 'active', 'paused', 'completed', 'archived', 'closed'];
  const categories = ['Market Research', 'Customer Satisfaction', 'Employee Feedback', 'Product Research', 'Academic Research', 'Event Feedback'];
  const languages = ['en', 'es', 'fr', 'de'];
  const surveyTitles = [
    'Customer Satisfaction Survey', 'Product Feedback', 'Market Research Study', 'Employee Engagement',
    'Brand Awareness Study', 'User Experience Feedback', 'Annual Review Survey', 'Event Feedback',
    'Website Usability Study', 'Training Evaluation', 'Service Quality Assessment', 'Product Launch Research',
    'Customer Journey Mapping', 'Competitor Analysis', 'Price Sensitivity Study', 'Feature Request Survey'
  ];
  
  return Array.from({ length: 75 }, (_, i) => {
    const isActive = Math.random() > 0.1;
    const status = isActive ? statuses[Math.floor(Math.random() * statuses.length)] : 'draft';
    const insertDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();
    const totalResponses = Math.floor(Math.random() * 500) + 10;
    const targetResponses = Math.floor(Math.random() * 1000) + 200;
    const accountId = Math.floor(Math.random() * 50) + 1;
    
    return {
      surveyId: i + 1,
      accountId,
      accountName: `Account ${accountId}`,
      title: surveyTitles[i % surveyTitles.length] + (i > 15 ? ` ${Math.floor(i / 16) + 1}` : ''),
      description: `Comprehensive survey to gather insights and feedback. This survey aims to collect valuable data for analysis and improvement.`,
      status,
      isActive,
      insertDate,
      publishDate: status !== 'draft' ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      closeDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      totalResponses,
      targetResponses,
      // Additional fields for admin UI
      id: i + 1,
      createdBy: Math.floor(Math.random() * 150) + 1,
      creatorName: `User ${Math.floor(Math.random() * 150) + 1}`,
      lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      language: languages[Math.floor(Math.random() * languages.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      tags: Array.from({ length: Math.floor(Math.random() * 4) }, () => {
        const tags = ['customer', 'feedback', 'research', 'satisfaction', 'product', 'service', 'quality', 'experience'];
        return tags[Math.floor(Math.random() * tags.length)];
      }).filter((tag, index, arr) => arr.indexOf(tag) === index),
      isPublic: Math.random() > 0.7,
      allowAnonymous: Math.random() > 0.3,
      requireLogin: Math.random() > 0.6,
      maxResponsesPerUser: Math.random() > 0.5 ? 1 : Math.floor(Math.random() * 5) + 1,
      estimatedDuration: Math.floor(Math.random() * 20) + 5,
      completionRate: targetResponses > 0 ? Math.min(100, Math.round((totalResponses / targetResponses) * 100)) : 0,
      averageRating: Math.random() * 2 + 3, // 3-5 rating
      lastResponseDate: totalResponses > 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      settings: {
        emailNotifications: Math.random() > 0.5,
        showProgressBar: Math.random() > 0.2,
        allowBackButton: Math.random() > 0.3,
        randomizeQuestions: Math.random() > 0.8,
        customTheme: Math.random() > 0.9 ? 'corporate' : '',
        thankyouMessage: Math.random() > 0.5 ? 'Thank you for your participation!' : '',
        redirectUrl: Math.random() > 0.8 ? 'https://example.com/thankyou' : '',
        collectIpAddress: Math.random() > 0.7,
        collectLocationData: Math.random() > 0.9
      }
    };
  });
};

const generateMockPolls = (): Poll[] => {
  const statuses = ['draft', 'active', 'completed', 'archived'];
  
  return Array.from({ length: 30 }, (_, i) => ({
    pollId: i + 1,
    accountId: Math.floor(Math.random() * 50) + 1,
    title: `Poll ${i + 1}: Public Opinion`,
    description: `This is a poll about public opinion on topic ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    isActive: Math.random() > 0.15,
    insertDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    totalVotes: Math.floor(Math.random() * 1000) + 100,
  }));
};

const generateMockCollectors = (): Collector[] => {
  const types = ['Web Link', 'Email', 'Social Media', 'QR Code', 'Embed'];
  const statuses = ['active', 'paused', 'completed'];
  
  return Array.from({ length: 100 }, (_, i) => ({
    collectorId: i + 1,
    surveyId: Math.floor(Math.random() * 75) + 1,
    name: `Collector ${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    isActive: Math.random() > 0.1,
    insertDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    totalResponses: Math.floor(Math.random() * 200) + 10,
    url: `https://collect.opinion.com/s/${i + 1}`,
  }));
};

const generateMockPayments = (): Payment[] => {
  const methods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Stripe'];
  const statuses = ['pending', 'completed', 'failed', 'refunded'];
  
  return Array.from({ length: 80 }, (_, i) => ({
    paymentId: i + 1,
    accountId: Math.floor(Math.random() * 50) + 1,
    amount: Math.floor(Math.random() * 500) + 50,
    currency: ['USD', 'EUR', 'GBP'][Math.floor(Math.random() * 3)],
    method: methods[Math.floor(Math.random() * methods.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    transactionId: Math.random() > 0.2 ? `TXN_${Date.now()}_${i}` : undefined,
    insertDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    processedDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  }));
};

const generateMockSystemEvents = (): SystemEvent[] => {
  const eventTypes = [
    'User Authentication',
    'Survey Publication',
    'Data Export',
    'Payment Processing',
    'System Maintenance',
    'Email Notification',
    'Account Creation',
    'Survey Response',
    'API Request',
    'Database Backup',
    'User Registration',
    'Password Reset',
    'Account Suspension',
    'Survey Completion',
    'File Upload',
    'Data Migration',
    'License Renewal',
    'Security Alert',
    'System Update',
    'Cache Clear'
  ];
  
  const descriptions = {
    'User Authentication': [
      'User login attempt successful',
      'Failed login attempt detected',
      'Multi-factor authentication enabled',
      'Session timeout expired',
      'Password changed successfully'
    ],
    'Survey Publication': [
      'Survey published to live environment',
      'Survey moved to draft status',
      'Survey scheduling configured',
      'Survey access permissions updated',
      'Survey template applied'
    ],
    'Data Export': [
      'Excel report generated successfully',
      'CSV data export completed',
      'PDF report generated',
      'Data export request queued',
      'Bulk export operation finished'
    ],
    'Payment Processing': [
      'Payment transaction completed',
      'Credit card authorization failed',
      'Refund processed successfully',
      'Subscription renewal processed',
      'Invoice generated and sent'
    ],
    'System Maintenance': [
      'Scheduled maintenance window started',
      'Database optimization completed',
      'System backup created',
      'Performance monitoring alert',
      'Service restart completed'
    ],
    'Email Notification': [
      'Welcome email sent to new user',
      'Survey invitation sent',
      'Password reset email delivered',
      'Account notification dispatched',
      'Bulk email campaign completed'
    ],
    'Account Creation': [
      'New user account created',
      'Account verification email sent',
      'Account activated by administrator',
      'Account permissions configured',
      'Account linked to organization'
    ],
    'Survey Response': [
      'Survey response recorded',
      'Partial response saved',
      'Response validation completed',
      'Response data processed',
      'Response threshold reached'
    ],
    'API Request': [
      'API endpoint called successfully',
      'API rate limit exceeded',
      'API authentication failed',
      'API request timeout',
      'API response cached'
    ],
    'Database Backup': [
      'Daily backup completed successfully',
      'Incremental backup created',
      'Backup verification passed',
      'Backup retention policy applied',
      'Backup restoration completed'
    ]
  };
  
  const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
  
  return Array.from({ length: 150 }, (_, i) => {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const eventDescriptions = descriptions[eventType as keyof typeof descriptions] || ['System event occurred'];
    const description = eventDescriptions[Math.floor(Math.random() * eventDescriptions.length)];
    
    // Weight severity towards low/medium for more realistic distribution
    const severityWeights = [0.5, 0.3, 0.15, 0.05]; // low, medium, high, critical
    const rand = Math.random();
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    let cumulative = 0;
    for (let j = 0; j < severityWeights.length; j++) {
      cumulative += severityWeights[j];
      if (rand <= cumulative) {
        severity = severities[j];
        break;
      }
    }
    
    return {
      eventId: i + 1,
      eventType,
      description,
      severity,
      insertDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      userId: Math.random() > 0.4 ? Math.floor(Math.random() * 150) + 1 : undefined,
      accountId: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 1 : undefined,
      additionalData: {
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: Math.random() > 0.5 ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        duration: Math.floor(Math.random() * 5000) + 100, // milliseconds
        status: Math.random() > 0.9 ? 'failed' : 'success'
      },
    };
  });
};

// Mock data instances
const mockUsers = generateMockUsers();
const mockUserHistory = generateMockUserHistory();
const mockAccounts = generateMockAccounts();
const mockSurveys = generateMockSurveys();
const mockPolls = generateMockPolls();
const mockCollectors = generateMockCollectors();
const mockPayments = generateMockPayments();
const mockSystemEvents = generateMockSystemEvents();

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const paginate = <T>(data: T[], params: PaginationParams): PaginatedResponse<T> => {
  const { page, limit, sortBy, sortOrder } = params;
  let sortedData = [...data];

  if (sortBy) {
    sortedData.sort((a: any, b: any) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
      if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
    },
  };
};

const filterData = <T>(data: T[], filters: FilterParams): T[] => {
  return data.filter((item: any) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableFields = ['userName', 'username', 'email', 'fullName', 'firstName', 'lastName', 'accountName', 'title', 'description', 'contactEmail'];
      const hasMatch = searchableFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchLower);
      });
      if (!hasMatch) return false;
    }

    if (filters.status && item.status !== filters.status) {
      return false;
    }

    if (filters.dateFrom) {
      const itemDate = new Date(item.insertDate);
      const fromDate = new Date(filters.dateFrom);
      if (itemDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const itemDate = new Date(item.insertDate);
      const toDate = new Date(filters.dateTo);
      if (itemDate > toDate) return false;
    }

    return true;
  });
};

// Mock API Service
class MockApiService {
  private async mockRequest<T>(data: T): Promise<ApiResponse<T>> {
    await delay(50); // Reduced delay for testing
    
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const stats: DashboardStats = {
      todayUsers: mockUsers.filter(u => {
        const today = new Date();
        const userDate = new Date(u.insertDate);
        return userDate.toDateString() === today.toDateString();
      }).length,
      activeUsers: mockUsers.filter(u => u.isActive).length,
      totalAccounts: mockAccounts.length,
      totalSurveys: mockSurveys.length,
      totalResponses: mockSurveys.reduce((sum, s) => sum + s.totalResponses, 0),
      revenue: mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    };

    return this.mockRequest(stats);
  }

  async getRecentUsers(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    // Simulate filtering by fromDate if provided (yesterday's users for dashboard)
    let filteredUsers = mockUsers;
    
    if (params.fromDate) {
      console.log('Mock API: Filtering users by fromDate:', params.fromDate);
      
      // Try to parse the date format from Dashboard: "Aug 12, 2025 00:00"
      let fromDate: Date;
      try {
        fromDate = new Date(params.fromDate);
        if (isNaN(fromDate.getTime())) {
          // Fallback: try to parse manually if Date constructor fails
          console.warn('Mock API: Failed to parse fromDate, using fallback parsing');
          fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday as fallback
        }
      } catch (e) {
        console.warn('Mock API: Error parsing fromDate, using yesterday as fallback:', e);
        fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday as fallback
      }
      
      const initialCount = mockUsers.length;
      filteredUsers = mockUsers.filter(user => {
        const userDate = new Date(user.insertDate);
        const isAfter = userDate >= fromDate;
        if (isAfter) {
          console.log(`Mock API: User ${user.userName} (${user.insertDate}) is after ${fromDate.toISOString()}`);
        }
        return isAfter;
      });
      
      console.log(`Mock API: Filtered from ${initialCount} to ${filteredUsers.length} users`);
    }
    
    const recentUsers = filteredUsers.sort((a, b) => new Date(b.insertDate).getTime() - new Date(a.insertDate).getTime());
    const finalFilteredUsers = filterData(recentUsers, params);
    const paginatedUsers = paginate(finalFilteredUsers, params);
    
    console.log('Mock API: getRecentUsers called with params:', params);
    console.log('Mock API: Final filtered users count:', filteredUsers.length);
    
    return this.mockRequest(paginatedUsers);
  }

  async getActiveUserHistory(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<UserHistory>>> {
    // Simulate filtering by typeIds and productId
    let filteredHistory = mockUserHistory;
    
    if (params.typeIds && Array.isArray(params.typeIds)) {
      filteredHistory = mockUserHistory.filter(history => 
        params.typeIds.includes(history.typeId)
      );
    }
    
    if (params.productId) {
      // In a real implementation, this would filter by productId
      // For mock, we'll just log it
      console.log('Mock API: Filtering by productId:', params.productId);
    }
    
    const recentHistory = filteredHistory.sort((a, b) => new Date(b.insertDate).getTime() - new Date(a.insertDate).getTime());
    const finalFilteredHistory = filterData(recentHistory, params);
    const paginatedHistory = paginate(finalFilteredHistory, params);
    
    console.log('Mock API: getActiveUserHistory called with params:', params);
    console.log('Mock API: Filtered history count:', filteredHistory.length);
    
    return this.mockRequest(paginatedHistory);
  }

  // Users
  async getUsers(params: PaginationParams & FilterParams & { fromDate?: string; toDate?: string }): Promise<ApiResponse<{ list: User[] }>> {
    let filteredUsers = mockUsers;
    
    // Apply date filtering if provided (like original JSP)
    if (params.fromDate || params.toDate) {
      filteredUsers = mockUsers.filter(user => {
        const userDate = new Date(user.insertDate);
        
        if (params.fromDate) {
          const fromDate = new Date(params.fromDate);
          if (userDate < fromDate) return false;
        }
        
        if (params.toDate) {
          const toDate = new Date(params.toDate);
          if (userDate > toDate) return false;
        }
        
        return true;
      });
    }
    
    const finalFilteredUsers = filterData(filteredUsers, params);
    
    // Return the format matching original JSP: { list: User[] }
    return {
      success: true,
      data: { list: finalFilteredUsers },
      timestamp: new Date().toISOString(),
    };
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    console.log('MockAPI getUser called with ID:', id, 'type:', typeof id);
    console.log('Available user IDs:', mockUsers.map(u => ({ userId: u.userId, type: typeof u.userId })));
    const user = mockUsers.find(u => u.userId === id);
    console.log('Found user:', user ? 'yes' : 'no');
    if (!user) {
      console.log('User not found, throwing error');
      throw {
        success: false,
        error: { code: '404', message: 'User not found' },
        timestamp: new Date().toISOString(),
      };
    }
    
    console.log('Returning user:', user);
    return this.mockRequest(user);
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    await delay(500); // Longer delay for create operation
    
    const newUser: User = {
      userId: Math.max(...mockUsers.map(u => u.userId)) + 1,
      userName: userData.username || '',
      email: userData.email || '',
      firstName: userData.fullName?.split(' ')[0] || '',
      lastName: userData.fullName?.split(' ').slice(1).join(' ') || '',
      countryName: 'United States',
      countryCode: 'US',
      provider: 'Email',
      isActive: userData.status === 'active',
      insertDate: new Date().toISOString(),
      lastLoginDate: undefined,
      clientIp: '127.0.0.1',
      // Add new fields for the admin UI
      id: Math.max(...mockUsers.map(u => u.userId)) + 1,
      username: userData.username || '',
      fullName: userData.fullName || '',
      role: userData.role as 'admin' | 'user' || 'user',
      status: userData.status as 'active' | 'inactive' || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: undefined,
    };
    
    mockUsers.push(newUser);
    return this.mockRequest(newUser);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    await delay(400); // Delay for update operation
    
    const userIndex = mockUsers.findIndex(u => u.userId === id || u.id === id);
    if (userIndex === -1) {
      throw {
        success: false,
        error: { code: '404', message: 'User not found' },
        timestamp: new Date().toISOString(),
      };
    }
    
    const existingUser = mockUsers[userIndex];
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      id: existingUser.id || existingUser.userId,
      userId: existingUser.userId,
      userName: userData.username || existingUser.userName,
      email: userData.email || existingUser.email,
      firstName: userData.fullName?.split(' ')[0] || existingUser.firstName,
      lastName: userData.fullName?.split(' ').slice(1).join(' ') || existingUser.lastName,
      isActive: userData.status === 'active',
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers[userIndex] = updatedUser;
    return this.mockRequest(updatedUser);
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    await delay(300); // Delay for delete operation
    
    const userIndex = mockUsers.findIndex(u => u.userId === id || u.id === id);
    if (userIndex === -1) {
      throw {
        success: false,
        error: { code: '404', message: 'User not found' },
        timestamp: new Date().toISOString(),
      };
    }
    
    mockUsers.splice(userIndex, 1);
    return this.mockRequest(undefined as any);
  }

  // Accounts
  async getAccounts(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<Account>>> {
    const filteredAccounts = filterData(mockAccounts, params);
    const paginatedAccounts = paginate(filteredAccounts, params);
    
    return this.mockRequest(paginatedAccounts);
  }

  async getAccount(id: number): Promise<ApiResponse<Account>> {
    console.log('MockAPI getAccount called with id:', id, 'type:', typeof id);
    console.log('Available account IDs:', mockAccounts.map(a => a.accountId));
    
    const account = mockAccounts.find(a => a.accountId === id);
    console.log('Found account:', account ? 'YES' : 'NO');
    
    if (!account) {
      console.log('Account not found, throwing error');
      throw {
        success: false,
        error: { code: '404', message: 'Account not found' },
        timestamp: new Date().toISOString(),
      };
    }
    
    console.log('About to return account via mockRequest');
    const result = await this.mockRequest(account);
    console.log('MockAPI getAccount result:', result);
    return result;
  }

  async createAccount(accountData: Partial<Account>): Promise<ApiResponse<Account>> {
    await delay(500); // Longer delay for create operation
    
    const servicePackageNames = ['Basic', 'Professional', 'Enterprise', 'Premium'];
    
    // Find the owner user if ownerId is provided
    let ownerUserName: string | undefined = undefined;
    if (accountData.ownerId) {
      const ownerUser = mockUsers.find(u => u.userId === accountData.ownerId);
      ownerUserName = ownerUser ? ownerUser.userName : undefined;
    }
    
    const newAccount: Account = {
      accountId: Math.max(...mockAccounts.map(a => a.accountId)) + 1,
      accountName: accountData.accountName || '',
      ownerId: accountData.ownerId,
      ownerUserName,
      servicePackageName: servicePackageNames[(accountData.packageId || 1) - 1] || 'Basic',
      packageId: accountData.packageId || 1,
      timezoneId: accountData.timezoneId || 1,
      timezone: ['UTC', 'EST (UTC-5)', 'PST (UTC-8)', 'CET (UTC+1)', 'JST (UTC+9)'][(accountData.timezoneId || 1) - 1],
      isActive: accountData.isActive !== undefined ? accountData.isActive : true,
      status: (accountData.isActive !== false) ? 'enabled' : 'disabled',
      insertDate: new Date().toISOString(),
      planExpirationDate: accountData.planExpirationDate,
      remainingResponses: accountData.remainingResponses || 1000,
      permissions: accountData.permissions || [],
      inheritPermissions: accountData.inheritPermissions || false,
      // Additional fields for the admin UI
      id: Math.max(...mockAccounts.map(a => a.accountId)) + 1,
      companyName: accountData.companyName,
      contactEmail: accountData.contactEmail,
      contactName: accountData.contactName,
      lastActivityDate: undefined,
      totalUsers: 0,
      totalSurveys: 0,
      totalResponses: 0,
    };
    
    mockAccounts.push(newAccount);
    return this.mockRequest(newAccount);
  }

  async updateAccount(id: number, accountData: Partial<Account>): Promise<ApiResponse<Account>> {
    await delay(400); // Delay for update operation
    
    const accountIndex = mockAccounts.findIndex(a => a.accountId === id);
    if (accountIndex === -1) {
      throw {
        success: false,
        error: { code: '404', message: 'Account not found' },
        timestamp: new Date().toISOString(),
      };
    }
    
    const existingAccount = mockAccounts[accountIndex];
    
    // Resolve ownerUserName if ownerId is being updated
    let ownerUserName = existingAccount.ownerUserName;
    if ('ownerId' in accountData) {
      if (accountData.ownerId) {
        const ownerUser = mockUsers.find(u => u.userId === accountData.ownerId);
        ownerUserName = ownerUser ? ownerUser.userName : undefined;
      } else {
        ownerUserName = undefined;
      }
    }
    
    const updatedAccount: Account = {
      ...existingAccount,
      ...accountData,
      ownerUserName,
      accountId: existingAccount.accountId,
      // Keep existing statistics unless explicitly updating
      totalUsers: accountData.totalUsers !== undefined ? accountData.totalUsers : existingAccount.totalUsers,
      totalSurveys: accountData.totalSurveys !== undefined ? accountData.totalSurveys : existingAccount.totalSurveys,
      totalResponses: accountData.totalResponses !== undefined ? accountData.totalResponses : existingAccount.totalResponses,
      insertDate: existingAccount.insertDate,
      lastActivityDate: new Date().toISOString(),
    };
    
    mockAccounts[accountIndex] = updatedAccount;
    return this.mockRequest(updatedAccount);
  }

  async deleteAccount(id: number): Promise<ApiResponse<void>> {
    await delay(300); // Delay for delete operation
    
    const accountIndex = mockAccounts.findIndex(a => a.accountId === id);
    if (accountIndex === -1) {
      throw {
        success: false,
        error: { code: '404', message: 'Account not found' },
        timestamp: new Date().toISOString(),
      };
    }
    
    mockAccounts.splice(accountIndex, 1);
    return this.mockRequest(undefined as any);
  }

  // Surveys - Main surveys page (all surveys across all accounts)
  async getSurveys(params?: { top?: number; from?: string; to?: string; accountId?: number | null }): Promise<ApiResponse<{ list: Survey[] }>> {
    await delay(400);
    
    // Convert mock surveys to match original API structure
    let surveysToReturn = mockSurveys.map(survey => ({
      opinionId: survey.surveyId!,
      accountId: survey.accountId,
      accountName: survey.accountName,
      name: survey.title!,
      description: survey.description,
      previewUrl: `https://preview.opinion.com/s/${survey.surveyId}`,
      started: survey.totalResponses!,
      completed: Math.floor(survey.totalResponses! * (survey.completionRate! / 100)),
      partial: Math.floor(survey.totalResponses! * 0.15), // 15% partial responses
      disqualified: Math.floor(survey.totalResponses! * 0.05), // 5% disqualified
      completionRate: survey.completionRate,
      timeTaken: {
        days: 0,
        hours: 0,
        minutes: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
        seconds: Math.floor(Math.random() * 60)
      },
      insertDate: survey.insertDate,
      modifyDate: survey.lastModified,
      cntControls: Math.floor(Math.random() * 25) + 5, // 5-30 questions
      status: survey.status,
      isActive: survey.isActive
    }));
    
    // Filter by accountId if specified
    if (params?.accountId !== undefined && params?.accountId !== null) {
      surveysToReturn = surveysToReturn.filter(s => s.accountId === params.accountId);
    }
    
    // Apply limit
    const limit = params?.top || 100;
    surveysToReturn = surveysToReturn.slice(0, limit);
    
    return this.mockRequest({ list: surveysToReturn });
  }

  // Copy survey to another account
  async copySurvey(opinionId: number, name: string, accountId: number): Promise<ApiResponse<{ opinionId: number }>> {
    await delay(600);
    
    // Find the original survey
    const originalSurvey = mockSurveys.find(s => s.surveyId === opinionId);
    if (!originalSurvey) {
      throw {
        success: false,
        error: { code: '404', message: 'Survey not found' },
        timestamp: new Date().toISOString(),
      };
    }
    
    // Create a new survey as a copy
    const newSurveyId = Math.max(...mockSurveys.map(s => s.surveyId!)) + 1;
    const newSurvey: Survey = {
      ...originalSurvey,
      surveyId: newSurveyId,
      id: newSurveyId,
      accountId,
      accountName: `Account ${accountId}`,
      title: name,
      totalResponses: 0,
      completionRate: 0,
      averageRating: 0,
      insertDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      lastResponseDate: undefined,
      status: 'draft',
      isActive: false
    };
    
    mockSurveys.push(newSurvey);
    return this.mockRequest({ opinionId: newSurveyId });
  }

  // Delete multiple surveys
  async deleteSurveys(opinionIds: number[], accountId?: number): Promise<ApiResponse<void>> {
    await delay(500);
    
    // Remove surveys from mockSurveys array
    opinionIds.forEach(opinionId => {
      const surveyIndex = mockSurveys.findIndex(s => s.surveyId === opinionId);
      if (surveyIndex !== -1) {
        // Optionally check accountId if provided
        if (accountId && mockSurveys[surveyIndex].accountId !== accountId) {
          return; // Skip if account doesn't match
        }
        mockSurveys.splice(surveyIndex, 1);
      }
    });
    
    return this.mockRequest(undefined as any);
  }

  async getSurvey(id: number): Promise<ApiResponse<Survey>> {
    const survey = mockSurveys.find(s => s.surveyId === id);
    if (!survey) {
      throw {
        success: false,
        error: { code: '404', message: 'Survey not found' },
        timestamp: new Date().toISOString(),
      };
    }
    
    return this.mockRequest(survey);
  }

  async createSurvey(surveyData: Partial<Survey>): Promise<ApiResponse<Survey>> {
    await delay(500); // Longer delay for create operation
    
    const newSurvey: Survey = {
      surveyId: Math.max(...mockSurveys.map(s => s.surveyId)) + 1,
      accountId: surveyData.accountId || 1,
      accountName: surveyData.accountName || `Account ${surveyData.accountId}`,
      title: surveyData.title || '',
      description: surveyData.description,
      status: surveyData.status || 'draft',
      isActive: surveyData.status !== 'draft',
      insertDate: new Date().toISOString(),
      publishDate: surveyData.publishDate,
      closeDate: surveyData.closeDate,
      totalResponses: 0,
      targetResponses: surveyData.targetResponses,
      // Additional fields for admin UI
      id: Math.max(...mockSurveys.map(s => s.surveyId)) + 1,
      createdBy: 1, // Current user ID
      creatorName: 'Admin User',
      lastModified: new Date().toISOString(),
      language: surveyData.language || 'en',
      category: surveyData.category,
      tags: surveyData.tags || [],
      isPublic: surveyData.isPublic || false,
      allowAnonymous: surveyData.allowAnonymous !== false,
      requireLogin: surveyData.requireLogin || false,
      maxResponsesPerUser: surveyData.maxResponsesPerUser || 1,
      estimatedDuration: surveyData.estimatedDuration || 5,
      completionRate: 0,
      averageRating: 0,
      lastResponseDate: undefined,
      settings: surveyData.settings || {
        emailNotifications: true,
        showProgressBar: true,
        allowBackButton: true,
        randomizeQuestions: false,
        customTheme: '',
        thankyouMessage: '',
        redirectUrl: '',
        collectIpAddress: false,
        collectLocationData: false
      }
    };
    
    mockSurveys.push(newSurvey);
    return this.mockRequest(newSurvey);
  }

  async updateSurvey(id: number, surveyData: Partial<Survey>): Promise<ApiResponse<Survey>> {
    await delay(400); // Delay for update operation
    
    const surveyIndex = mockSurveys.findIndex(s => s.surveyId === id);
    if (surveyIndex === -1) {
      throw {
        success: false,
        error: { code: '404', message: 'Survey not found' },
        timestamp: new Date().toISOString(),
      };
    }
    
    const existingSurvey = mockSurveys[surveyIndex];
    
    const updatedSurvey: Survey = {
      ...existingSurvey,
      ...surveyData,
      surveyId: existingSurvey.surveyId,
      id: existingSurvey.id,
      insertDate: existingSurvey.insertDate,
      lastModified: new Date().toISOString(),
      // Update isActive based on status
      isActive: surveyData.status ? surveyData.status !== 'draft' : existingSurvey.isActive,
      settings: {
        ...existingSurvey.settings,
        ...surveyData.settings
      }
    };
    
    mockSurveys[surveyIndex] = updatedSurvey;
    return this.mockRequest(updatedSurvey);
  }

  async deleteSurvey(id: number): Promise<ApiResponse<void>> {
    await delay(300); // Delay for delete operation
    
    const surveyIndex = mockSurveys.findIndex(s => s.surveyId === id);
    if (surveyIndex === -1) {
      throw {
        success: false,
        error: { code: '404', message: 'Survey not found' },
        timestamp: new Date().toISOString(),
      };
    }
    
    mockSurveys.splice(surveyIndex, 1);
    return this.mockRequest(undefined as any);
  }

  // Polls
  async getPolls(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<Poll>>> {
    const filteredPolls = filterData(mockPolls, params);
    const paginatedPolls = paginate(filteredPolls, params);
    
    return this.mockRequest(paginatedPolls);
  }

  // Collectors
  async getCollectors(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<Collector>>> {
    const filteredCollectors = filterData(mockCollectors, params);
    const paginatedCollectors = paginate(filteredCollectors, params);
    
    return this.mockRequest(paginatedCollectors);
  }

  // Payments
  async getPayments(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    const filteredPayments = filterData(mockPayments, params);
    const paginatedPayments = paginate(filteredPayments, params);
    
    return this.mockRequest(paginatedPayments);
  }

  // System Events
  async getSystemEvents(params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<SystemEvent>>> {
    const filteredEvents = filterData(mockSystemEvents, params);
    const paginatedEvents = paginate(filteredEvents, params);
    
    return this.mockRequest(paginatedEvents);
  }

  // User Messages
  async getUserMessages(userId: number, params?: PaginationParams & FilterParams): Promise<ApiResponse<{ list: any[] }>> {
    await delay(300);
    
    // Generate mock messages for the user
    const messages = [
      {
        id: 1,
        name: 'Welcome to Opinion Platform',
        content: 'Thank you for joining our platform. We are excited to have you on board!',
        closeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        publishDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        excludeDate: undefined,
        modifyDate: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'System Maintenance Notice',
        content: 'Scheduled maintenance will occur this weekend from 2 AM to 4 AM EST.',
        closeDate: undefined,
        publishDate: undefined,
        excludeDate: undefined,
        modifyDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    
    return this.mockRequest({ list: messages });
  }

  async createUserMessage(userId: number, data: { name: string; content: string }): Promise<ApiResponse<{ id: number }>> {
    await delay(400);
    
    const newId = Math.floor(Math.random() * 1000) + 100;
    return this.mockRequest({ id: newId });
  }

  async deleteUserMessages(userId: number, messageIds: number[]): Promise<ApiResponse<void>> {
    await delay(300);
    return this.mockRequest(undefined as any);
  }

  async publishUserMessage(userId: number, messageId: number): Promise<ApiResponse<void>> {
    await delay(300);
    return this.mockRequest(undefined as any);
  }

  // User Accounts
  async getUserAccounts(userId: number): Promise<ApiResponse<{ list: any[] }>> {
    await delay(300);
    
    // Generate mock accounts for the user matching the actual API response structure
    const accounts = [
      {
        accountId: 101,
        accountName: 'Marketing Survey Account',
        servicePackageName: 'Professional',
        isActive: true,
        insertDate: 'Aug 13, 2025 10:58:44', // Match the actual date format
        ownerId: userId, // This user owns this account
      },
      {
        accountId: 102,
        accountName: 'Customer Feedback',
        servicePackageName: 'Basic',
        isActive: true,
        insertDate: 'Aug 10, 2025 14:22:15',
        ownerId: userId, // This user owns this account
      },
      {
        accountId: 201,
        accountName: 'Shared Research Account',
        servicePackageName: 'Enterprise',
        isActive: true,
        insertDate: 'Jul 15, 2025 09:30:22',
        ownerId: 999, // This account is owned by someone else but shared with this user
      },
    ];
    
    return this.mockRequest({ list: accounts });
  }

  async createUserAccount(userId: number, data: { productId: number; accountName: string }): Promise<ApiResponse<{ id: number }>> {
    await delay(400);
    
    const newId = Math.floor(Math.random() * 1000) + 300;
    return this.mockRequest({ id: newId });
  }

  async attachUserAccount(userId: number, accountId: number): Promise<ApiResponse<void>> {
    await delay(300);
    return this.mockRequest(undefined as any);
  }

  async detachUserAccount(userId: number, accountId: number): Promise<ApiResponse<void>> {
    await delay(300);
    return this.mockRequest(undefined as any);
  }

  // User History
  async getUserHistory(userId: number): Promise<ApiResponse<{ list: any[] }>> {
    await delay(300);
    
    // Generate mock history data for the user
    const historyData = [
      {
        id: 1,
        typeId: 1, // Login
        sourceId: 1, // Opinion
        countryName: 'United States',
        clientIp: '192.168.1.10',
        insertDate: 'Aug 13, 2025 10:30:45',
      },
      {
        id: 2,
        typeId: 6, // Auto Login
        sourceId: 3, // BackOffice
        countryName: 'United States',
        clientIp: '192.168.1.10',
        insertDate: 'Aug 13, 2025 09:15:22',
      },
      {
        id: 3,
        typeId: 4, // Change password
        sourceId: 1, // Opinion
        countryName: 'United States',
        clientIp: '192.168.1.10',
        insertDate: 'Aug 10, 2025 16:45:30',
      },
      {
        id: 4,
        typeId: 1, // Login
        sourceId: 5, // Api
        countryName: 'United States',
        clientIp: '192.168.1.15',
        insertDate: 'Aug 9, 2025 14:20:18',
      },
      {
        id: 5,
        typeId: 3, // Register
        sourceId: 1, // Opinion
        countryName: 'United States',
        clientIp: '192.168.1.10',
        insertDate: 'Aug 1, 2025 12:00:00',
      },
    ];
    
    return this.mockRequest({ list: historyData });
  }

  // Packages
  async getPackages(productId: number, includeNonActive: boolean = false): Promise<ApiResponse<{ list: any[] }>> {
    await delay(300);
    
    // Generate mock packages data matching the actual API response structure
    const packages = [
      {
        packageId: 1,
        packageName: 'Basic',
        insertDate: 'Apr 08, 2012 14:32:18',
        description: 'Basic package with essential features',
        isDefault: true,
        defaultUsagePeriod: null,
      },
      {
        packageId: 2,
        packageName: 'Professional',
        insertDate: 'Jun 15, 2012 09:45:30',
        description: 'Professional package with advanced features',
        isDefault: false,
        defaultUsagePeriod: 30,
      },
      {
        packageId: 3,
        packageName: 'PRO',
        insertDate: 'Mar 02, 2013 05:23:15',
        description: 'PRO package with premium features',
        isDefault: false,
        defaultUsagePeriod: 30,
      },
      {
        packageId: 4,
        packageName: 'Enterprise',
        insertDate: 'Nov 20, 2013 16:12:08',
        description: 'Enterprise package for large organizations',
        isDefault: false,
        defaultUsagePeriod: 365,
      },
    ];
    
    // Filter packages based on productId if provided
    let filteredPackages = packages;
    if (productId && productId !== 1) {
      // For different products, return different package sets
      filteredPackages = packages.filter(pkg => pkg.packageId <= 2); // Example filtering
    }
    
    // Filter based on includeNonActive flag if needed
    // For this mock, we assume all packages are active
    
    return this.mockRequest({ list: filteredPackages });
  }

  // Get opinions/surveys list for an account
  async getOpinionsList(accountId: number, opinionTypeId: number = 1): Promise<ApiResponse<{ list: any[] }>> {
    await delay(300);
    
    // Mock surveys data based on the original implementation
    const mockSurveys = [
      {
        opinionId: 1001,
        name: 'Customer Satisfaction Survey 2024',
        started: 1250,
        completed: 987,
        partial: 156,
        disqualified: 0,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 8,
          seconds: 45
        },
        modifyDate: 'Jan 15, 2024 14:30:22',
        cntControls: 12,
        previewUrl: `#survey-preview/${1001}`
      },
      {
        opinionId: 1002,
        name: 'Product Feedback Form',
        started: 843,
        completed: 756,
        partial: 87,
        disqualified: 0,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 5,
          seconds: 12
        },
        modifyDate: 'Jan 12, 2024 09:15:33',
        cntControls: 8,
        previewUrl: `#survey-preview/${1002}`
      },
      {
        opinionId: 1003,
        name: 'Employee Engagement Survey',
        started: 542,
        completed: 498,
        partial: 44,
        disqualified: 0,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 12,
          seconds: 8
        },
        modifyDate: 'Jan 10, 2024 16:45:11',
        cntControls: 15,
        previewUrl: `#survey-preview/${1003}`
      }
    ];

    // Filter by account - in reality this would be done on the backend
    return this.mockRequest({
      list: accountId === 1 ? mockSurveys : [] // Only return surveys for account 1 in mock
    });
  }

  // Get collectors list for an account
  async getCollectorsByAccount(accountId: number): Promise<ApiResponse<{ list: any[] }>> {
    await delay(300);
    
    // Mock collectors data based on the original implementation
    const mockCollectors = [
      {
        collectorId: 2001,
        name: 'Customer Survey Direct Link',
        sourceTypeId: 1, // Direct link
        statusId: 1, // Open
        started: 1250,
        completed: 987,
        partial: 156,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 8,
          seconds: 45
        },
        opinionId: 1001,
        opinionName: 'Customer Satisfaction Survey 2024',
        opinionTypeName: 'Survey',
        accountId: 1,
        lastResponseDate: 'Jan 15, 2024 14:30:22'
      },
      {
        collectorId: 2002,
        name: 'Product Feedback CINT Panel',
        sourceTypeId: 2, // CINT panel
        statusId: 5, // Panel is live
        started: 843,
        completed: 756,
        partial: 87,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 5,
          seconds: 12
        },
        opinionId: 1002,
        opinionName: 'Product Feedback Form',
        opinionTypeName: 'Survey',
        accountId: 1,
        lastResponseDate: 'Jan 12, 2024 09:15:33'
      },
      {
        collectorId: 2003,
        name: 'Employee Survey Link',
        sourceTypeId: 1, // Direct link
        statusId: 2, // Closed
        started: 542,
        completed: 498,
        partial: 44,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 12,
          seconds: 8
        },
        opinionId: 1003,
        opinionName: 'Employee Engagement Survey',
        opinionTypeName: 'Survey',
        accountId: 1,
        lastResponseDate: 'Jan 10, 2024 16:45:11'
      }
    ];

    // Filter by account - in reality this would be done on the backend
    return this.mockRequest({
      list: accountId === 1 ? mockCollectors : [] // Only return collectors for account 1 in mock
    });
  }

  // Delete collectors
  async deleteCollectors(collectorIds: number[]): Promise<ApiResponse<void>> {
    await delay(500);
    
    // Mock successful deletion
    return this.mockRequest(undefined);
  }

  // Get business details for billing
  async getBusinessDetails(accountId: number): Promise<ApiResponse<any>> {
    await delay(300);
    
    // Mock business details data based on the original implementation
    const mockBusinessDetails = {
      companyName: 'InqWise Technologies',
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Business Ave',
      address2: 'Suite 100',
      city: 'San Francisco',
      countryId: 232, // United States
      stateId: 5, // California (example)
      postalCode: '94102',
      phone1: '+1-415-555-0123'
    };
    
    return this.mockRequest(mockBusinessDetails);
  }

  // Update billing settings
  async updateBillingSettings(accountId: number, settings: {
    currencyCode?: string;
    minDeposit?: number;
    maxDeposit?: number;
    taxable?: boolean;
  }): Promise<ApiResponse<void>> {
    await delay(500);
    
    // Mock successful update
    return this.mockRequest(undefined);
  }

  // Update business details
  async updateBusinessDetails(accountId: number, details: {
    companyName?: string;
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    countryId?: number;
    stateId?: number;
    postalCode?: string;
    phone1?: string;
  }): Promise<ApiResponse<void>> {
    await delay(500);
    
    // Mock successful update
    return this.mockRequest(undefined);
  }

  // Transaction methods
  
  // Get account details (including balance)
  async getAccountDetails(accountId: number): Promise<ApiResponse<any>> {
    await delay(300);
    
    // Mock account details with balance information
    const mockAccountDetails = {
      accountId,
      accountName: `Account ${accountId}`,
      balance: 1250.75, // Current balance
      isActive: true,
      lastFundTransaction: {
        amount: 500.00,
        modifyDate: 'Aug 10, 2025 14:30:22',
        creditCard: '4532',
        creditCardTypeId: 1, // Visa
        comments: 'Monthly payment'
      }
    };
    
    return this.mockRequest(mockAccountDetails);
  }

  // Get transactions
  async getTransactions(accountId: number, options?: {
    groupBy?: string;
    transactionTypes?: number[];
  }): Promise<ApiResponse<any>> {
    await delay(400);
    
    // Generate mock transaction data based on the original structure
    const mockTransactions = this.generateMockTransactions(accountId, options?.transactionTypes);
    const groupedData = this.groupTransactionsByMonth(mockTransactions);
    
    return this.mockRequest({
      list: groupedData,
      lastFundTransaction: {
        amount: 500.00,
        modifyDate: 'Aug 10, 2025 14:30:22',
        creditCard: '4532',
        creditCardTypeId: 1
      }
    });
  }

  // Credit account
  async credit(accountId: number, amount: number, comments: string): Promise<ApiResponse<void>> {
    await delay(500);
    
    // Mock successful credit
    return this.mockRequest(undefined);
  }

  // Debit account
  async debit(accountId: number, amount: number, comments: string): Promise<ApiResponse<void>> {
    await delay(500);
    
    // Mock successful debit
    return this.mockRequest(undefined);
  }

  // Manual payment
  async manualPayment(accountId: number, amount: number, comments: string): Promise<ApiResponse<void>> {
    await delay(500);
    
    // Mock successful manual payment
    return this.mockRequest(undefined);
  }

  // Manual refund
  async manualRefund(accountId: number, amount: number, comments: string): Promise<ApiResponse<void>> {
    await delay(500);
    
    // Mock successful manual refund
    return this.mockRequest(undefined);
  }

  // Helper method to generate mock transactions
  private generateMockTransactions(accountId: number, transactionTypes?: number[]) {
    const transactions = [];
    let runningBalance = 1250.75;
    
    // Transaction types based on the original:
    // 1: Starting balance, 2: Payment, 3: Charge, 4: Credit, 5: Debit, 6: Refund, 7: Charge canceled, 9: Promotion code, 10: Activation fee
    const allTransactionTypes = [1, 2, 3, 4, 5, 6, 7, 9, 10];
    const typesToGenerate = transactionTypes || allTransactionTypes;
    
    // Generate transactions over the last 6 months
    const now = new Date();
    let transactionId = 1001;
    
    for (let monthsAgo = 6; monthsAgo >= 0; monthsAgo--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      const transactionsInMonth = Math.floor(Math.random() * 8) + 2; // 2-9 transactions per month
      
      for (let i = 0; i < transactionsInMonth; i++) {
        const typeId = typesToGenerate[Math.floor(Math.random() * typesToGenerate.length)];
        const dayInMonth = Math.floor(Math.random() * 28) + 1;
        const transactionDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayInMonth);
        const modifyDate = transactionDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) + ' ' + transactionDate.toLocaleTimeString('en-US');
        
        let amount = 0;
        let debit = 0;
        let credit = 0;
        let comments = '';
        let referenceId: number | undefined;
        let chargeDescription: string | undefined;
        let creditCard: string | undefined;
        let creditCardTypeId: number | undefined;
        
        switch (typeId) {
          case 1: // Starting balance
            amount = 1000;
            credit = 1000;
            runningBalance = 1000;
            comments = 'Initial account balance';
            break;
          case 2: // Payment
            amount = Math.floor(Math.random() * 500) + 100; // $100-600
            credit = amount;
            runningBalance += amount;
            creditCard = Math.floor(Math.random() * 9000 + 1000).toString();
            creditCardTypeId = Math.floor(Math.random() * 4) + 1; // 1-4 (Visa, MC, Discover, Amex)
            comments = 'Online payment';
            break;
          case 3: // Charge
            amount = Math.floor(Math.random() * 200) + 50; // $50-250
            debit = amount;
            runningBalance -= amount;
            referenceId = Math.floor(Math.random() * 1000) + 5000;
            chargeDescription = `Survey responses - ${Math.floor(Math.random() * 500) + 100} responses`;
            break;
          case 4: // Credit
            amount = Math.floor(Math.random() * 100) + 25; // $25-125
            credit = amount;
            runningBalance += amount;
            comments = 'Account credit adjustment';
            break;
          case 5: // Debit
            amount = Math.floor(Math.random() * 75) + 10; // $10-85
            debit = amount;
            runningBalance -= amount;
            comments = 'Administrative adjustment';
            break;
          case 6: // Refund
            amount = Math.floor(Math.random() * 150) + 50; // $50-200
            credit = amount;
            runningBalance += amount;
            comments = 'Payment refund';
            break;
          case 7: // Charge canceled
            amount = Math.floor(Math.random() * 100) + 30; // $30-130
            credit = amount;
            runningBalance += amount;
            referenceId = Math.floor(Math.random() * 1000) + 5000;
            break;
          case 9: // Promotion code
            amount = Math.floor(Math.random() * 200) + 100; // $100-300
            credit = amount;
            runningBalance += amount;
            comments = 'Promotional credit';
            break;
          case 10: // Activation fee
            amount = 25;
            debit = amount;
            runningBalance -= amount;
            comments = 'Account activation fee';
            break;
        }
        
        transactions.push({
          transactionId: transactionId++,
          typeId,
          accountId,
          amount,
          debit: debit > 0 ? debit : undefined,
          credit: credit > 0 ? credit : undefined,
          balance: runningBalance,
          comments,
          referenceId,
          chargeDescription,
          creditCard,
          creditCardTypeId,
          modifyDate,
          insertDate: transactionDate.toISOString()
        });
      }
    }
    
    // Sort by date descending (newest first)
    return transactions.sort((a, b) => new Date(b.insertDate).getTime() - new Date(a.insertDate).getTime());
  }

  // Helper method to group transactions by month
  private groupTransactionsByMonth(transactions: any[]) {
    const groups: { [key: string]: any } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.insertDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!groups[monthKey]) {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        groups[monthKey] = {
          fromDate: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          toDate: monthEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          transactions: [],
          debit: 0,
          credit: 0,
          balance: 0,
          invoices: []
        };
      }
      
      groups[monthKey].transactions.push(transaction);
      groups[monthKey].debit += transaction.debit || 0;
      groups[monthKey].credit += transaction.credit || 0;
      groups[monthKey].balance = transaction.balance; // Use the latest balance in the group
    });
    
    // Convert to array and sort by date descending
    return Object.values(groups).sort((a: any, b: any) => 
      new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime()
    );
  }

  // Payment methods
  
  // Get payment details
  async getPaymentDetails(userId: number, accountId: number): Promise<ApiResponse<any>> {
    await delay(300);
    
    // Mock payment details with pre-filled business address
    return this.mockRequest({
      hasBusinessAddress: true,
      firstName: 'John',
      lastName: 'Doe', 
      address1: '123 Main Street',
      address2: 'Suite 100',
      city: 'San Francisco',
      countryId: 232, // United States
      stateId: 5, // California
      postalCode: '94107'
    });
  }

  // Get charges
  async getCharges(accountId: number, charges: number[], statusId: number): Promise<ApiResponse<any>> {
    await delay(400);
    
    // Generate mock charges data based on statusId
    const allMockCharges = [
      {
        chargeId: 1001,
        chargeDate: '2025-08-15T10:30:00Z',
        name: 'Survey Responses - Consumer Research',
        amount: 125.50,
        statusId: 2, // Paid
        invoiced: false
      },
      {
        chargeId: 1002, 
        chargeDate: '2025-08-12T14:15:00Z',
        name: 'Data Collection - Market Analysis',
        amount: 89.25,
        statusId: 2, // Paid
        invoiced: false
      },
      {
        chargeId: 1003,
        chargeDate: '2025-08-10T09:45:00Z', 
        name: 'Premium Survey Features',
        amount: 245.00,
        statusId: 1, // Unpaid
        invoiced: false
      },
      {
        chargeId: 1004,
        chargeDate: '2025-08-08T16:22:00Z',
        name: 'Additional Respondents Package',
        amount: 175.80,
        statusId: 2, // Paid
        invoiced: true
      },
      {
        chargeId: 1005,
        chargeDate: '2025-08-05T11:18:00Z',
        name: 'Advanced Analytics Report',
        amount: 95.00,
        statusId: 7, // Canceled
        invoiced: false
      },
      {
        chargeId: 1006,
        chargeDate: '2025-08-03T13:55:00Z',
        name: 'Custom Survey Templates',
        amount: 65.75,
        statusId: 2, // Paid
        invoiced: false
      }
    ];
    
    // Filter charges based on statusId and specific charge IDs if provided
    let filteredCharges = allMockCharges;
    
    if (charges.length > 0) {
      // Filter by specific charge IDs
      filteredCharges = allMockCharges.filter(charge => charges.includes(charge.chargeId));
    }
    
    // Filter by status ID
    if (statusId) {
      filteredCharges = filteredCharges.filter(charge => charge.statusId === statusId);
    }
    
    const amountDue = filteredCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const currentBalance = 150.75;
    const amountToFund = Math.max(0, amountDue - currentBalance);
    
    return this.mockRequest({
      list: filteredCharges,
      amountDue,
      amountToFund
    });
  }

  // Direct payment
  async directPayment(paymentData: {
    userId: number;
    accountId: number;
    firstName: string;
    lastName: string;
    creditCardTypeId: number;
    creditCardNumber: string;
    expDateMonth: number;
    expDateYear: number;
    cvv2Number: string;
    address1: string;
    address2: string;
    city: string;
    countryCode: string;
    countryId: number;
    stateId: number | string;
    postalCode: string;
    amount: number;
    charges: number[];
    isAddressChanged: boolean;
  }): Promise<ApiResponse<any>> {
    await delay(2000); // Simulate payment processing time
    
    // Mock payment validation - simulate some error conditions
    if (paymentData.amount <= 0) {
      return {
        success: false,
        error: {
          code: 'InvalidAmount',
          message: 'Bill amount must be greater than 0'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (paymentData.creditCardNumber.length < 15) {
      return {
        success: false,
        error: {
          code: 'InvalidCCNumerOrCCType',
          message: 'Please enter a valid credit card number and type.'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (!paymentData.city.trim()) {
      return {
        success: false,
        error: {
          code: 'BillingCityIsMandatory',
          message: 'Please enter a valid city in the billing address.'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (paymentData.postalCode.length < 5) {
      return {
        success: false,
        error: {
          code: 'InvalidPostalCode',
          message: 'Please enter a valid postal code in the billing address.'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (paymentData.expDateYear < currentYear || 
        (paymentData.expDateYear === currentYear && paymentData.expDateMonth < currentMonth)) {
      return {
        success: false,
        error: {
          code: 'InvalidExpiration',
          message: 'Please enter a valid credit card expiration date.'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (paymentData.amount > 10000) {
      return {
        success: false,
        error: {
          code: 'AmountExcededTheUpperLimit', 
          message: 'This transaction cannot be processed. The amount exceeded the upper limit.'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    // Mock successful payment
    return this.mockRequest({
      transactionId: Math.floor(Math.random() * 100000) + 10000,
      amount: paymentData.amount,
      status: 'success',
      message: 'Payment processed successfully'
    });
  }

  // Cancel charge
  async cancelCharge(accountId: number, chargeId: number): Promise<ApiResponse<any>> {
    await delay(500);
    
    // Mock successful cancellation
    return this.mockRequest({
      chargeId,
      status: 'canceled',
      message: 'Charge cancelled successfully'
    });
  }

  // Recurring charges methods
  
  // Get recurring charges
  async getRecurringCharges(accountId: number): Promise<ApiResponse<any>> {
    await delay(400);
    
    // Generate mock recurring charges data
    const mockRecurringCharges = [
      {
        chargeId: 2001,
        nextDate: '2025-09-15T00:00:00Z',
        chargeName: 'PRO Plan Monthly Subscription',
        amount: 24.00,
        isTaxable: false,
        cycle: 'Monthly 1/1'
      },
      {
        chargeId: 2002,
        nextDate: '2025-12-01T00:00:00Z',
        chargeName: 'Enterprise Plan Annual Billing',
        amount: 288.00,
        isTaxable: true,
        cycle: 'Annually 12/12'
      },
      {
        chargeId: 2003,
        nextDate: '2025-09-01T00:00:00Z',
        chargeName: 'Premium Features Add-on',
        amount: 15.99,
        isTaxable: false,
        cycle: 'Monthly 1/1'
      },
      {
        chargeId: 2004,
        nextDate: '2026-01-15T00:00:00Z',
        chargeName: 'Advanced Analytics Package',
        amount: 120.00,
        isTaxable: true,
        cycle: 'Quarterly 3/3'
      }
    ];
    
    // Filter recurring charges based on accountId (in a real implementation)
    const filteredCharges = accountId === 1 ? mockRecurringCharges : [];
    
    return this.mockRequest({
      list: filteredCharges
    });
  }

  // Delete recurring charge
  async deleteRecurringCharge(chargeId: number): Promise<ApiResponse<any>> {
    await delay(500);
    
    // Mock successful deletion
    return this.mockRequest({
      chargeId,
      status: 'deleted',
      message: 'Recurring charge deleted successfully'
    });
  }

  // Uninvoiced charges methods
  
  // Get uninvoiced charges
  async getUninvoicedCharges(accountId: number): Promise<ApiResponse<{ list: any[] }>> {
    await delay(400);
    
    // Generate mock uninvoiced charges data
    const mockUninvoicedCharges = [
      {
        chargeId: 3001,
        chargeDate: '2024-01-15T10:30:00Z',
        name: 'Survey Package 100 responses',
        amount: 49.99,
        statusId: 2,
        invoiced: false
      },
      {
        chargeId: 3002,
        chargeDate: '2024-01-10T14:20:00Z',
        name: 'Additional responses - Survey #456',
        amount: 25.00,
        statusId: 2,
        invoiced: false
      },
      {
        chargeId: 3003,
        chargeDate: '2024-01-08T09:15:00Z',
        name: 'Premium features upgrade',
        amount: 19.99,
        statusId: 2,
        invoiced: false
      },
      {
        chargeId: 3004,
        chargeDate: '2024-01-05T16:45:00Z',
        name: 'Data export service',
        amount: 9.99,
        statusId: 2,
        invoiced: false
      },
      {
        chargeId: 3005,
        chargeDate: '2024-01-03T12:00:00Z',
        name: 'Custom branding package',
        amount: 39.99,
        statusId: 2,
        invoiced: false
      }
    ];
    
    // Filter charges based on accountId (in a real implementation)
    const filteredCharges = accountId === 1 ? mockUninvoicedCharges : [];
    
    return this.mockRequest({
      list: filteredCharges
    });
  }

  // Create invoice from charges
  async createInvoice(accountId: number, chargeIds: number[]): Promise<ApiResponse<{ invoiceId?: number }>> {
    await delay(600);
    
    // Generate random invoice ID
    const invoiceId = Math.floor(Math.random() * 90000) + 10000;
    
    return this.mockRequest({
      invoiceId,
      success: true,
      message: `Invoice #${invoiceId} created successfully with ${chargeIds.length} charges`
    });
  }

  // Merge charges into existing invoice
  async mergeChargesIntoInvoice(accountId: number, invoiceId: number, chargeIds: number[]): Promise<ApiResponse<any>> {
    await delay(500);
    
    return this.mockRequest({
      success: true,
      message: `Successfully merged ${chargeIds.length} charges into invoice #${invoiceId}`
    });
  }

  // Get draft invoices
  async getDraftInvoices(accountId: number): Promise<ApiResponse<{ list: any[] }>> {
    await delay(300);
    
    // Generate mock draft invoices matching invoices.getInvoices API structure
    // Default query: {"accountId":1,"statusId":1} where statusId=1 means Draft
    const mockDraftInvoices = [
      {
        invoiceId: 12345,
        insertDate: 'Jan 12, 2024 11:30:22', // Match original JSP date format
        statusId: 1, // Draft status
        status: 'Draft',
        amount: 75.48,
        accountId: accountId,
        description: 'Invoice for survey charges',
        dueDate: 'Feb 12, 2024 11:30:22',
        invoiceDate: 'Jan 12, 2024 11:30:22'
      },
      {
        invoiceId: 12346,
        insertDate: 'Jan 10, 2024 09:15:33', // Match original JSP date format
        statusId: 1, // Draft status
        status: 'Draft', 
        amount: 142.99,
        accountId: accountId,
        description: 'Invoice for premium features',
        dueDate: 'Feb 10, 2024 09:15:33',
        invoiceDate: 'Jan 10, 2024 09:15:33'
      },
      {
        invoiceId: 12347,
        insertDate: 'Jan 08, 2024 16:20:15', // Match original JSP date format
        statusId: 1, // Draft status
        status: 'Draft',
        amount: 89.50,
        accountId: accountId,
        description: 'Invoice for data collection services',
        dueDate: 'Feb 08, 2024 16:20:15',
        invoiceDate: 'Jan 08, 2024 16:20:15'
      }
    ];
    
    // Filter draft invoices based on accountId and statusId=1 (Draft)
    // This matches the default query: {"accountId":1,"statusId":1}
    const filteredInvoices = accountId === 1 ? mockDraftInvoices : [];
    
    return this.mockRequest({
      list: filteredInvoices
    });
  }

  // Get invoices (all or filtered by status)
  async getInvoices(accountId: number, statusId?: number): Promise<ApiResponse<{ list: any[] }>> {
    await delay(400);
    
    // Generate mock invoices with different statuses
    const allMockInvoices = [
      {
        invoiceId: 12345,
        invoiceDate: '2024-01-12',
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        statusId: 1, // Draft
        amount: 75.48,
        accountId: accountId
      },
      {
        invoiceId: 12346,
        invoiceDate: '2024-01-10',
        fromDate: '2023-12-01',
        toDate: '2023-12-31',
        statusId: 1, // Draft
        amount: 142.99,
        accountId: accountId
      },
      {
        invoiceId: 12344,
        invoiceDate: '2024-01-05',
        fromDate: '2023-11-01',
        toDate: '2023-11-30',
        statusId: 2, // Open
        amount: 89.50,
        accountId: accountId
      },
      {
        invoiceId: 12343,
        invoiceDate: '2023-12-28',
        fromDate: '2023-10-01',
        toDate: '2023-10-31',
        statusId: 2, // Open
        amount: 234.75,
        accountId: accountId
      },
      {
        invoiceId: 12342,
        invoiceDate: '2023-12-15',
        fromDate: '2023-09-01',
        toDate: '2023-09-30',
        statusId: 2, // Open
        amount: 156.80,
        accountId: accountId
      }
    ];
    
    // Filter by accountId and optionally by statusId
    let filteredInvoices = accountId === 1 ? allMockInvoices : [];
    if (statusId) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.statusId === statusId);
    }
    
    return this.mockRequest({
      list: filteredInvoices
    });
  }

  // Delete invoices
  async deleteInvoices(invoiceIds: number[]): Promise<ApiResponse<void>> {
    await delay(800);
    
    // Simulate potential errors for some invoices
    if (invoiceIds.includes(12344)) {
      return this.mockRequest(
        null,
        true,
        'Cannot delete invoice #12344: Invoice has been finalized and cannot be deleted'
      );
    }
    
    return this.mockRequest(undefined);
  }

  // Create empty invoice
  async createEmptyInvoice(accountId: number): Promise<ApiResponse<{ invoiceId?: number }>> {
    await delay(600);
    
    // Generate new invoice ID
    const invoiceId = Math.floor(Math.random() * 90000) + 10000;
    
    return this.mockRequest({
      invoiceId,
      success: true,
      message: `Empty invoice #${invoiceId} created successfully`
    });
  }

  // Get invoice details
  async getInvoiceDetails(accountId: number, invoiceId: number, fromDate?: string, toDate?: string): Promise<ApiResponse<any>> {
    await delay(500);
    
    // Generate comprehensive invoice details
    const mockInvoiceDetails = {
      invoiceId,
      accountId,
      statusId: 1, // Draft by default
      invoiceDate: null,
      fromDate: fromDate || '2024-08-01T00:00:00Z',
      toDate: toDate || '2024-08-31T23:59:59Z',
      amount: 125.48, // Total charges amount
      notes: 'Sample invoice notes for testing purposes',
      // Bill to information
      companyName: 'InqWise Technologies Ltd',
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Business Avenue',
      address2: 'Suite 200',
      city: 'San Francisco',
      countryId: 232, // United States
      stateId: 5, // California
      postalCode: '94102',
      phone1: '+1-415-555-0123',
      // Charges associated with this invoice
      charges: {
        list: [
          {
            chargeId: 5001,
            chargeDate: '2024-08-15T10:30:00Z',
            name: 'Survey Response Package',
            description: '100 additional survey responses',
            amount: 49.99
          },
          {
            chargeId: 5002,
            chargeDate: '2024-08-12T14:20:00Z',
            name: 'Premium Analytics',
            description: 'Advanced reporting and analytics features',
            amount: 35.50
          },
          {
            chargeId: 5003,
            chargeDate: '2024-08-10T09:45:00Z',
            name: 'Data Export Service',
            description: 'CSV and Excel data export functionality',
            amount: 19.99
          },
          {
            chargeId: 5004,
            chargeDate: '2024-08-08T16:15:00Z',
            name: 'Custom Branding',
            description: 'Custom survey branding and themes',
            amount: 20.00
          }
        ]
      },
      // Transactions/payments for this invoice
      transactions: {
        list: [
          {
            transactionId: 5908,
            modifyDate: 'Aug 17, 2025',
            typeId: 2, // Payment
            amount: 10.00,
            creditCard: '4532',
            creditCardTypeId: 1 // Visa
          }
        ],
        totalCredit: 10.00
      }
    };
    
    return this.mockRequest(mockInvoiceDetails);
  }

  // Update invoice
  async updateInvoice(params: any): Promise<ApiResponse<any>> {
    await delay(600);
    
    // Simulate validation
    if (!params.firstName || !params.lastName) {
      return {
        success: false,
        error: {
          code: 'ValidationError',
          message: 'First name and last name are required'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (!params.address1 || !params.city) {
      return {
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Address and city are required'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    // Simulate successful update
    const result: any = {
      invoiceId: params.invoiceId,
      success: true,
      message: 'Invoice updated successfully'
    };
    
    // If opening the invoice (statusId = 2), return the invoice ID for redirect
    if (params.statusId === 2) {
      result.invoiceId = params.invoiceId;
    }
    
    return this.mockRequest(result);
  }

  // Get charges for specific invoice
  async getInvoiceCharges(accountId: number, invoiceId: number): Promise<ApiResponse<any>> {
    await delay(400);
    
    // Generate mock charges for the invoice
    const mockCharges = {
      list: [
        {
          chargeId: 5001,
          chargeDate: '2024-08-15T10:30:00Z',
          name: 'Survey Response Package',
          description: '100 additional survey responses',
          amount: 49.99
        },
        {
          chargeId: 5002,
          chargeDate: '2024-08-12T14:20:00Z',
          name: 'Premium Analytics',
          description: 'Advanced reporting and analytics features',
          amount: 35.50
        },
        {
          chargeId: 5003,
          chargeDate: '2024-08-10T09:45:00Z',
          name: 'Data Export Service',
          description: 'CSV and Excel data export functionality',
          amount: 19.99
        },
        {
          chargeId: 5004,
          chargeDate: '2024-08-08T16:15:00Z',
          name: 'Custom Branding',
          description: 'Custom survey branding and themes',
          amount: 20.00
        }
      ]
    };
    
    return this.mockRequest(mockCharges);
  }

  // Remove charges from invoice
  async removeChargesFromInvoice(chargeIds: number[]): Promise<ApiResponse<void>> {
    await delay(700);
    
    // Mock successful removal
    return this.mockRequest(undefined);
  }

  // Create invoice with full details (new overloaded method)
  async createInvoiceWithDetails(params: {
    accountId: number;
    statusId: number;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    countryId?: number;
    stateId?: number;
    postalCode?: string;
    phone1?: string;
    notes?: string;
    fromDate?: string;
    toDate?: string;
    charges?: number[];
  }): Promise<ApiResponse<{ invoiceId?: number }>> {
    await delay(800);
    
    // Validate required fields
    if (!params.firstName || !params.lastName) {
      return {
        success: false,
        error: {
          code: 'ValidationError',
          message: 'First name and last name are required'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (!params.address1 || !params.city) {
      return {
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Address line 1 and city are required'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (!params.countryId) {
      return {
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Country is required'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (!params.postalCode) {
      return {
        success: false,
        error: {
          code: 'ValidationError',
          message: 'ZIP/Postal code is required'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    // Generate random invoice ID
    const invoiceId = Math.floor(Math.random() * 90000) + 10000;
    
    const statusText = params.statusId === 1 ? 'draft' : 'open';
    const chargeCount = params.charges?.length || 0;
    
    return this.mockRequest({
      invoiceId,
      success: true,
      message: `Invoice #${invoiceId} created successfully as ${statusText} with ${chargeCount} charges`
    });
  }

  // Get all collectors (for standalone collectors page)
  async getAllCollectors(filter?: { includeExpired?: boolean; top?: number; from?: string; to?: string }): Promise<ApiResponse<{ list: any[] }>> {
    await delay(400);
    
    // Mock comprehensive collectors data from multiple accounts
    const mockCollectors = [
      {
        collectorId: 3001,
        name: 'Customer Satisfaction Direct Link',
        sourceTypeId: 1, // Direct link
        statusId: 1, // Open
        started: 1250,
        completed: 987,
        partial: 156,
        disqualified: 0,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 8,
          seconds: 45
        },
        opinionId: 1001,
        opinionName: 'Customer Satisfaction Survey 2024',
        opinionTypeName: 'Survey',
        accountId: 1,
        accountName: 'InqWise Technologies',
        lastResponseDate: 'Jan 15, 2024 14:30:22'
      },
      {
        collectorId: 3002,
        name: 'Product Feedback CINT Panel',
        sourceTypeId: 2, // CINT panel
        statusId: 5, // Panel is live
        started: 843,
        completed: 756,
        partial: 87,
        disqualified: 12,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 5,
          seconds: 12
        },
        opinionId: 1002,
        opinionName: 'Product Feedback Form',
        opinionTypeName: 'Survey',
        accountId: 1,
        accountName: 'InqWise Technologies',
        lastResponseDate: 'Jan 12, 2024 09:15:33'
      },
      {
        collectorId: 3003,
        name: 'Employee Survey Link',
        sourceTypeId: 1, // Direct link
        statusId: 2, // Closed
        started: 542,
        completed: 498,
        partial: 44,
        disqualified: 0,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 12,
          seconds: 8
        },
        opinionId: 1003,
        opinionName: 'Employee Engagement Survey',
        opinionTypeName: 'Survey',
        accountId: 2,
        accountName: 'Tech Solutions Inc',
        lastResponseDate: 'Jan 10, 2024 16:45:11'
      },
      {
        collectorId: 3004,
        name: 'Market Research Panel',
        sourceTypeId: 2, // CINT panel
        statusId: 6, // Panel has been completed
        started: 2100,
        completed: 1856,
        partial: 234,
        disqualified: 89,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 7,
          seconds: 23
        },
        opinionId: 1004,
        opinionName: 'Market Research Study Q1 2024',
        opinionTypeName: 'Survey',
        accountId: 3,
        accountName: 'Research Partners LLC',
        lastResponseDate: 'Jan 08, 2024 11:22:45'
      },
      {
        collectorId: 3005,
        name: 'Website Usability Test',
        sourceTypeId: 1, // Direct link
        statusId: 3, // Awaiting payment
        started: 156,
        completed: 134,
        partial: 22,
        disqualified: 0,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 15,
          seconds: 32
        },
        opinionId: 1005,
        opinionName: 'Website User Experience Survey',
        opinionTypeName: 'Survey',
        accountId: 4,
        accountName: 'Digital Agency Corp',
        lastResponseDate: 'Jan 05, 2024 08:15:12'
      },
      {
        collectorId: 3006,
        name: 'Brand Awareness Study',
        sourceTypeId: 2, // CINT panel
        statusId: 8, // Canceled
        started: 67,
        completed: 23,
        partial: 44,
        disqualified: 15,
        timeTaken: {
          days: 0,
          hours: 0,
          minutes: 6,
          seconds: 18
        },
        opinionId: 1006,
        opinionName: 'Brand Recognition Survey',
        opinionTypeName: 'Survey',
        accountId: 2,
        accountName: 'Tech Solutions Inc',
        lastResponseDate: 'Dec 28, 2023 13:44:56'
      }
    ];
    
    // Apply filters if provided
    let filteredCollectors = mockCollectors;
    
    if (!filter?.includeExpired) {
      // Filter out expired/canceled collectors
      filteredCollectors = filteredCollectors.filter(c => c.statusId !== 8);
    }
    
    const top = filter?.top || 100;
    if (filteredCollectors.length > top) {
      filteredCollectors = filteredCollectors.slice(0, top);
    }
    
    return this.mockRequest({
      list: filteredCollectors
    });
  }

  // Get all invoices (for standalone billing invoices page)
  async getAllInvoices(filter?: { statusId?: number | null }): Promise<ApiResponse<{ list: any[] }>> {
    await delay(400);
    
    // Mock comprehensive invoices data from multiple accounts
    const mockInvoices = [
      {
        invoiceId: 1,
        accountId: 1,
        accountName: 'glassfox admin',
        invoiceDate: 'Aug 17, 2025',
        fromDate: 'Aug 01, 2025',
        toDate: 'Aug 18, 2025',
        statusId: 2, // Open
        amount: 0.00
      },
      {
        invoiceId: 2,
        accountId: 2,
        accountName: 'Tech Solutions Inc',
        invoiceDate: 'Aug 15, 2025',
        fromDate: 'Jul 01, 2025',
        toDate: 'Jul 31, 2025',
        statusId: 1, // Draft
        amount: 450.25
      },
      {
        invoiceId: 3,
        accountId: 3,
        accountName: 'Research Partners LLC',
        invoiceDate: 'Aug 10, 2025',
        fromDate: 'Jun 01, 2025',
        toDate: 'Jun 30, 2025',
        statusId: 2, // Open
        amount: 1250.00
      },
      {
        invoiceId: 4,
        accountId: 1,
        accountName: 'glassfox admin',
        invoiceDate: 'Aug 05, 2025',
        fromDate: 'May 01, 2025',
        toDate: 'May 31, 2025',
        statusId: 1, // Draft
        amount: 89.99
      },
      {
        invoiceId: 5,
        accountId: 4,
        accountName: 'Digital Agency Corp',
        invoiceDate: 'Aug 01, 2025',
        fromDate: 'Apr 01, 2025',
        toDate: 'Apr 30, 2025',
        statusId: 2, // Open
        amount: 675.50
      },
      {
        invoiceId: 6,
        accountId: 2,
        accountName: 'Tech Solutions Inc',
        invoiceDate: 'Jul 28, 2025',
        fromDate: 'Mar 01, 2025',
        toDate: 'Mar 31, 2025',
        statusId: 1, // Draft
        amount: 299.75
      }
    ];
    
    // Apply status filter if provided
    let filteredInvoices = mockInvoices;
    if (filter?.statusId !== undefined && filter?.statusId !== null) {
      filteredInvoices = mockInvoices.filter(invoice => invoice.statusId === filter.statusId);
    }
    
    return this.mockRequest({
      list: filteredInvoices
    });
  }

  // Delete billing invoices (for standalone billing invoices page)
  async deleteBillingInvoices(invoiceIds: number[]): Promise<ApiResponse<void>> {
    await delay(600);
    
    // Mock successful deletion (or simulate some failures)
    // For testing, let's say invoice ID 3 cannot be deleted
    if (invoiceIds.includes(3)) {
      return {
        success: false,
        error: {
          code: 'CannotDeleteInvoice',
          message: 'Cannot delete invoice #3: Invoice has been finalized and cannot be deleted'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    return this.mockRequest(undefined as any);
  }
}

export const mockApiService = new MockApiService();
export default mockApiService;
