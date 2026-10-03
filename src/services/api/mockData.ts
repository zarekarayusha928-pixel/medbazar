import { Pharmacy, Branch, Medicine, Inventory, Customer, Order, Prescription, Staff, Category } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Antibiotics', description: 'Bacterial infection treatment', medicineCount: 24 },
  { id: 'cat_2', name: 'Pain Relief & Analgesics', description: 'Painkillers and fever reducers', medicineCount: 45 },
  { id: 'cat_3', name: 'Cardiovascular', description: 'Heart and blood pressure care', medicineCount: 18 },
  { id: 'cat_4', name: 'Diabetes Care', description: 'Insulin and blood sugar control', medicineCount: 30 },
  { id: 'cat_5', name: 'Vitamins & Supplements', description: 'Wellness and immunity boosters', medicineCount: 60 },
  { id: 'cat_6', name: 'Dermatology & Skincare', description: 'Ointments, creams and lotions', medicineCount: 15 },
];

export const MOCK_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm_1',
    name: 'Apothecary Healthcare',
    legalName: 'Apothecary Healthcare Private Limited',
    licenseNumber: '20B/MH-PUN-104928',
    phone: '+91 98230 11223',
    email: 'contact@apothecary.com',
    status: 'ACTIVE',
    branchCount: 3,
    createdAt: '2025-01-15',
  },
  {
    id: 'pharm_2',
    name: 'MediCure Pharmacy',
    legalName: 'MediCure Retail Pharma Ltd',
    licenseNumber: '20B/MH-PUN-409212',
    phone: '+91 94220 55443',
    email: 'info@medicure.com',
    status: 'ACTIVE',
    branchCount: 2,
    createdAt: '2025-03-10',
  },
  {
    id: 'pharm_3',
    name: 'Wellness Chemist',
    legalName: 'Wellness Chemists Partnership',
    licenseNumber: '20B/MH-MUM-883921',
    phone: '+91 98900 12345',
    email: 'support@wellnesschemist.com',
    status: 'PENDING',
    branchCount: 1,
    createdAt: '2025-09-20',
  }
];

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'branch_1',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    name: 'Apothecary Main Branch - Pune Station',
    address: 'Shop 12-14, Central Plaza, Station Road',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    phone: '+91 98230 11223',
    status: 'ACTIVE',
    operatingHours: '08:00 AM - 11:00 PM',
    createdAt: '2025-01-15'
  },
  {
    id: 'branch_2',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    name: 'Apothecary Wagholi Branch',
    address: 'Plot 45, Nagar Road, Near Oxygen Hub',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '412207',
    phone: '+91 98230 11224',
    status: 'ACTIVE',
    operatingHours: '09:00 AM - 10:00 PM',
    createdAt: '2025-04-01'
  },
  {
    id: 'branch_3',
    organizationId: 'pharm_2',
    organizationName: 'MediCure Pharmacy',
    name: 'MediCure Kothrud Branch',
    address: 'Paud Road, Opp Metro Station',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411038',
    phone: '+91 94220 55443',
    status: 'ACTIVE',
    operatingHours: '24 Hours Open',
    createdAt: '2025-03-10'
  }
];

export const MOCK_MEDICINES: Medicine[] = [
  {
    id: 'med_1',
    name: 'Paracetamol 650mg (Dolo)',
    genericName: 'Paracetamol',
    brand: 'Micro Labs',
    composition: 'Paracetamol 650 mg',
    dosageForm: 'TABLET',
    strength: '650mg',
    categoryId: 'cat_2',
    categoryName: 'Pain Relief & Analgesics',
    prescriptionRequired: false,
    barcode: '8901234567890',
    manufacturer: 'Micro Labs Ltd',
    status: 'ACTIVE'
  },
  {
    id: 'med_2',
    name: 'Amoxicillin & Potassium Clavulanate 625mg (Augmentin)',
    genericName: 'Amoxicillin + Clavulanic Acid',
    brand: 'GSK',
    composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    dosageForm: 'TABLET',
    strength: '625mg',
    categoryId: 'cat_1',
    categoryName: 'Antibiotics',
    prescriptionRequired: true,
    barcode: '8901234567891',
    manufacturer: 'GlaxoSmithKline',
    status: 'ACTIVE'
  },
  {
    id: 'med_3',
    name: 'Metformin HCl 500mg (Glycomet)',
    genericName: 'Metformin Hydrochloride',
    brand: 'USV Ltd',
    composition: 'Metformin Hydrochloride 500 mg',
    dosageForm: 'TABLET',
    strength: '500mg',
    categoryId: 'cat_4',
    categoryName: 'Diabetes Care',
    prescriptionRequired: true,
    barcode: '8901234567892',
    manufacturer: 'USV Private Ltd',
    status: 'ACTIVE'
  },
  {
    id: 'med_4',
    name: 'Amlodipine 5mg (Amlong)',
    genericName: 'Amlodipine Besylate',
    brand: 'Micro Labs',
    composition: 'Amlodipine 5 mg',
    dosageForm: 'TABLET',
    strength: '5mg',
    categoryId: 'cat_3',
    categoryName: 'Cardiovascular',
    prescriptionRequired: true,
    barcode: '8901234567893',
    manufacturer: 'Micro Labs Ltd',
    status: 'ACTIVE'
  },
  {
    id: 'med_5',
    name: 'Multivitamin & Mineral Capsules (Becosules)',
    genericName: 'Vitamin B Complex + Vitamin C',
    brand: 'Pfizer',
    composition: 'B-Complex + Vitamin C + Calcium',
    dosageForm: 'CAPSULE',
    strength: 'Standard',
    categoryId: 'cat_5',
    categoryName: 'Vitamins & Supplements',
    prescriptionRequired: false,
    barcode: '8901234567894',
    manufacturer: 'Pfizer India',
    status: 'ACTIVE'
  }
];

export const MOCK_INVENTORY: Inventory[] = [
  {
    id: 'inv_1',
    organizationId: 'pharm_1',
    branchId: 'branch_1',
    branchName: 'Apothecary Main Branch - Pune Station',
    medicineId: 'med_1',
    medicine: MOCK_MEDICINES[0],
    quantity: 120,
    reorderLevel: 30,
    sellingPrice: 32.50,
    mrp: 35.00,
    status: 'IN_STOCK',
    updatedAt: '2026-10-02T10:00:00Z',
    batches: [
      { id: 'b_1', inventoryId: 'inv_1', batchNumber: 'BCH-2025-091', expiryDate: '2027-08-31', quantity: 120, purchasePrice: 22.00 }
    ]
  },
  {
    id: 'inv_2',
    organizationId: 'pharm_1',
    branchId: 'branch_1',
    branchName: 'Apothecary Main Branch - Pune Station',
    medicineId: 'med_2',
    medicine: MOCK_MEDICINES[1],
    quantity: 12,
    reorderLevel: 25,
    sellingPrice: 210.00,
    mrp: 230.00,
    status: 'LOW_STOCK',
    updatedAt: '2026-10-02T11:30:00Z',
    batches: [
      { id: 'b_2', inventoryId: 'inv_2', batchNumber: 'AUG-8831', expiryDate: '2026-12-15', quantity: 12, purchasePrice: 155.00 }
    ]
  },
  {
    id: 'inv_3',
    organizationId: 'pharm_1',
    branchId: 'branch_1',
    branchName: 'Apothecary Main Branch - Pune Station',
    medicineId: 'med_3',
    medicine: MOCK_MEDICINES[2],
    quantity: 85,
    reorderLevel: 20,
    sellingPrice: 48.00,
    mrp: 55.00,
    status: 'IN_STOCK',
    updatedAt: '2026-09-30T15:20:00Z',
    batches: [
      { id: 'b_3', inventoryId: 'inv_3', batchNumber: 'GLY-7712', expiryDate: '2028-03-31', quantity: 85, purchasePrice: 30.00 }
    ]
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '+91 98765 43210',
    createdAt: '2025-05-10',
    addresses: [
      { id: 'addr_1', type: 'HOME', addressLine: 'Flat 402, Sunshine Heights, Kalyani Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411006', isDefault: true }
    ]
  },
  {
    id: 'cust_2',
    name: 'Priya Verma',
    email: 'priya.v@example.com',
    phone: '+91 97654 32109',
    createdAt: '2025-06-18',
    addresses: [
      { id: 'addr_2', type: 'HOME', addressLine: 'Bungalow 12, Lane 5, Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411001', isDefault: true }
    ]
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord_101',
    orderNumber: 'MB-2026-8801',
    organizationId: 'pharm_1',
    pharmacyName: 'Apothecary Healthcare',
    branchId: 'branch_1',
    branchName: 'Apothecary Main Branch - Pune Station',
    customerId: 'cust_1',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98765 43210',
    orderType: 'ONLINE',
    status: 'PRESCRIPTION_REVIEW',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE',
    items: [
      { id: 'oi_1', orderId: 'ord_101', medicineId: 'med_2', medicineName: 'Amoxicillin & Potassium Clavulanate 625mg (Augmentin)', quantity: 1, unitPrice: 210.00, total: 210.00, prescriptionRequired: true },
      { id: 'oi_2', orderId: 'ord_101', medicineId: 'med_1', medicineName: 'Paracetamol 650mg (Dolo)', quantity: 2, unitPrice: 32.50, total: 65.00, prescriptionRequired: false }
    ],
    subtotal: 275.00,
    discount: 15.00,
    deliveryFee: 40.00,
    total: 300.00,
    deliveryAddress: 'Flat 402, Sunshine Heights, Kalyani Nagar, Pune 411006',
    prescriptionId: 'presc_1',
    prescriptionStatus: 'PENDING',
    createdAt: '2026-10-02T18:45:00Z'
  },
  {
    id: 'ord_102',
    orderNumber: 'MB-2026-8802',
    organizationId: 'pharm_1',
    pharmacyName: 'Apothecary Healthcare',
    branchId: 'branch_1',
    branchName: 'Apothecary Main Branch - Pune Station',
    customerId: 'cust_2',
    customerName: 'Priya Verma',
    customerPhone: '+91 97654 32109',
    orderType: 'ONLINE',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    items: [
      { id: 'oi_3', orderId: 'ord_102', medicineId: 'med_5', medicineName: 'Multivitamin & Mineral Capsules (Becosules)', quantity: 3, unitPrice: 45.00, total: 135.00, prescriptionRequired: false }
    ],
    subtotal: 135.00,
    discount: 0,
    deliveryFee: 30.00,
    total: 165.00,
    deliveryAddress: 'Bungalow 12, Lane 5, Koregaon Park, Pune 411001',
    createdAt: '2026-10-02T19:10:00Z'
  }
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'presc_1',
    organizationId: 'pharm_1',
    customerId: 'cust_1',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98765 43210',
    orderId: 'ord_101',
    fileUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    fileName: 'Rx_Dr_Patil_Augmentin.jpg',
    fileType: 'IMAGE',
    status: 'PENDING_REVIEW',
    notes: 'Uploaded by customer for Order #MB-2026-8801',
    createdAt: '2026-10-02T18:46:00Z'
  }
];

export const MOCK_STAFF: Staff[] = [
  {
    id: 'stf_1',
    organizationId: 'pharm_1',
    branchId: 'branch_1',
    branchName: 'Apothecary Main Branch - Pune Station',
    userId: 'u_owner',
    name: 'Dr. Suresh Mehta',
    email: 'suresh.mehta@apothecary.com',
    phone: '+91 98230 11223',
    role: 'PHARMACY_OWNER',
    status: 'ACTIVE',
    joinedAt: '2025-01-15'
  },
  {
    id: 'stf_2',
    organizationId: 'pharm_1',
    branchId: 'branch_1',
    branchName: 'Apothecary Main Branch - Pune Station',
    userId: 'u_pharm',
    name: 'Amit Deshmukh (Reg. Pharmacist #MH-44091)',
    email: 'amit.d@apothecary.com',
    phone: '+91 98230 44556',
    role: 'PHARMACIST',
    status: 'ACTIVE',
    joinedAt: '2025-02-01'
  },
  {
    id: 'stf_3',
    organizationId: 'pharm_1',
    branchId: 'branch_1',
    branchName: 'Apothecary Main Branch - Pune Station',
    userId: 'u_cashier',
    name: 'Kiran Kulkarni',
    email: 'kiran.k@apothecary.com',
    phone: '+91 98230 99887',
    role: 'CASHIER',
    status: 'ACTIVE',
    joinedAt: '2025-03-15'
  }
];
