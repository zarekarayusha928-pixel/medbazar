import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Med Bazar database seed...');

  // 1. Categories
  const catPain = await prisma.category.upsert({
    where: { name: 'Pain Relief & Analgesics' },
    update: {},
    create: {
      id: 'cat_pain',
      name: 'Pain Relief & Analgesics',
      description: 'Antipyretics, NSAIDs, and pain management medications.',
    },
  });

  const catAnti = await prisma.category.upsert({
    where: { name: 'Antibiotics & Anti-Infectives' },
    update: {},
    create: {
      id: 'cat_anti',
      name: 'Antibiotics & Anti-Infectives',
      description: 'Prescription antibiotics and anti-bacterial therapies.',
    },
  });

  const catChronic = await prisma.category.upsert({
    where: { name: 'Chronic Care & Diabetes' },
    update: {},
    create: {
      id: 'cat_chronic',
      name: 'Chronic Care & Diabetes',
      description: 'Oral hypoglycemics, statins, and blood pressure regulators.',
    },
  });

  const catGastro = await prisma.category.upsert({
    where: { name: 'Gastrointestinal Care' },
    update: {},
    create: {
      id: 'cat_gastro',
      name: 'Gastrointestinal Care',
      description: 'Antacids, PPIs, anti-emetics, and digestive aids.',
    },
  });

  console.log('✅ Categories seeded.');

  // 2. Global Medicine Catalogue
  const medDolo = await prisma.medicine.upsert({
    where: { barcode: '8901148202511' },
    update: {},
    create: {
      id: 'med_dolo_650',
      name: 'Paracetamol 650mg (Dolo)',
      genericName: 'Paracetamol / Acetaminophen',
      brand: 'Dolo-650',
      composition: 'Paracetamol IP 650mg',
      dosageForm: 'TABLET',
      strength: '650mg',
      categoryId: catPain.id,
      prescriptionRequired: false,
      barcode: '8901148202511',
      manufacturer: 'Micro Labs Limited',
      status: 'ACTIVE',
    },
  });

  const medAzithro = await prisma.medicine.upsert({
    where: { barcode: '8901148203322' },
    update: {},
    create: {
      id: 'med_azithro_500',
      name: 'Azithromycin 500mg (Azithral)',
      genericName: 'Azithromycin Dihydrate',
      brand: 'Azithral 500',
      composition: 'Azithromycin IP 500mg',
      dosageForm: 'TABLET',
      strength: '500mg',
      categoryId: catAnti.id,
      prescriptionRequired: true,
      barcode: '8901148203322',
      manufacturer: 'Alembic Pharmaceuticals Ltd',
      status: 'ACTIVE',
    },
  });

  const medMetformin = await prisma.medicine.upsert({
    where: { barcode: '8901148204433' },
    update: {},
    create: {
      id: 'med_metformin_500',
      name: 'Metformin 500mg ER (Glycomet)',
      genericName: 'Metformin Hydrochloride Extended Release',
      brand: 'Glycomet 500 SR',
      composition: 'Metformin HCl IP 500mg',
      dosageForm: 'TABLET',
      strength: '500mg ER',
      categoryId: catChronic.id,
      prescriptionRequired: true,
      barcode: '8901148204433',
      manufacturer: 'USV Private Limited',
      status: 'ACTIVE',
    },
  });

  const medPan = await prisma.medicine.upsert({
    where: { barcode: '8901148205544' },
    update: {},
    create: {
      id: 'med_pan_40',
      name: 'Pantoprazole 40mg (Pan 40)',
      genericName: 'Pantoprazole Sodium Gastro-resistant',
      brand: 'Pan 40',
      composition: 'Pantoprazole Sodium IP 40mg',
      dosageForm: 'TABLET',
      strength: '40mg',
      categoryId: catGastro.id,
      prescriptionRequired: false,
      barcode: '8901148205544',
      manufacturer: 'Alkem Laboratories Ltd',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Global Medicines seeded.');

  // 3. Demo Users across Roles
  const userAdmin = await prisma.user.upsert({
    where: { email: 'admin@medbazar.com' },
    update: {},
    create: {
      id: 'usr_admin_1',
      email: 'admin@medbazar.com',
      name: 'Neha Kapoor (Platform Superadmin)',
      phone: '+91 99999 00001',
      role: 'PLATFORM_ADMIN',
      status: 'ACTIVE',
    },
  });

  const userOwnerA = await prisma.user.upsert({
    where: { email: 'suresh.mehta@apothecary.com' },
    update: {},
    create: {
      id: 'usr_owner_1',
      email: 'suresh.mehta@apothecary.com',
      name: 'Dr. Suresh Mehta',
      phone: '+91 98230 11223',
      role: 'PHARMACY_OWNER',
      status: 'ACTIVE',
    },
  });

  const userOwnerB = await prisma.user.upsert({
    where: { email: 'anita.joshi@medicure.com' },
    update: {},
    create: {
      id: 'usr_owner_2',
      email: 'anita.joshi@medicure.com',
      name: 'Dr. Anita Joshi',
      phone: '+91 98222 33445',
      role: 'PHARMACY_OWNER',
      status: 'ACTIVE',
    },
  });

  const userPharmacist = await prisma.user.upsert({
    where: { email: 'amit.d@apothecary.com' },
    update: {},
    create: {
      id: 'usr_pharm_1',
      email: 'amit.d@apothecary.com',
      name: 'Amit Deshmukh (Registered Pharmacist)',
      phone: '+91 98230 44556',
      role: 'PHARMACIST',
      status: 'ACTIVE',
    },
  });

  const userCashier = await prisma.user.upsert({
    where: { email: 'kiran.k@apothecary.com' },
    update: {},
    create: {
      id: 'usr_cash_1',
      email: 'kiran.k@apothecary.com',
      name: 'Kiran Kulkarni (Counter Cashier)',
      phone: '+91 98230 99887',
      role: 'CASHIER',
      status: 'ACTIVE',
    },
  });

  const userDelivery = await prisma.user.upsert({
    where: { email: 'ramesh.p@apothecary.com' },
    update: {},
    create: {
      id: 'usr_deliv_1',
      email: 'ramesh.p@apothecary.com',
      name: 'Ramesh Pawar (Delivery Rider)',
      phone: '+91 98230 33221',
      role: 'DELIVERY_STAFF',
      status: 'ACTIVE',
    },
  });

  const userCustomer1 = await prisma.user.upsert({
    where: { email: 'rajesh.sharma@example.com' },
    update: {},
    create: {
      id: 'usr_cust_1',
      email: 'rajesh.sharma@example.com',
      name: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  // Customer Profile & Address
  await prisma.customerProfile.upsert({
    where: { userId: userCustomer1.id },
    update: {},
    create: {
      id: 'cp_cust_1',
      userId: userCustomer1.id,
      addresses: {
        create: [
          {
            id: 'addr_1',
            type: 'HOME',
            addressLine: 'Flat 402, Shivajinagar Heights',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411005',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('✅ Users & Roles seeded.');

  // 4. Multi-Tenant Organizations (Pharmacies)
  // Pharmacy A: Apothecary Healthcare (2 branches)
  const orgA = await prisma.organization.upsert({
    where: { licenseNumber: '20B/MH-PUN-104928' },
    update: {},
    create: {
      id: 'pharm_1',
      name: 'Apothecary Healthcare',
      legalName: 'Apothecary Retail Chemists Pvt Ltd',
      licenseNumber: '20B/MH-PUN-104928',
      gstNumber: '27AABCA1234F1Z5',
      phone: '+91 98230 11223',
      email: 'contact@apothecary.com',
      ownerName: 'Dr. Suresh Mehta',
      ownerEmail: 'suresh.mehta@apothecary.com',
      ownerPhone: '+91 98230 11223',
      address: 'Shop 4-6, Silver Plaza, F.C. Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
      status: 'ACTIVE',
    },
  });

  // Pharmacy B: MediCure Pharmacy (1 branch)
  const orgB = await prisma.organization.upsert({
    where: { licenseNumber: '20B/MH-PUN-409212' },
    update: {},
    create: {
      id: 'pharm_2',
      name: 'MediCure Pharmacy',
      legalName: 'MediCure Dispensary & Chemist Ltd',
      licenseNumber: '20B/MH-PUN-409212',
      gstNumber: '27AABCM5678G2Z9',
      phone: '+91 98222 33445',
      email: 'support@medicure.com',
      ownerName: 'Dr. Anita Joshi',
      ownerEmail: 'anita.joshi@medicure.com',
      ownerPhone: '+91 98222 33445',
      address: 'Plot 12, Deccan Gymkhana',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Organizations (Multi-Tenancy) seeded.');

  // 5. Branches
  // Pharmacy A - Branch 1
  const branchA1 = await prisma.branch.upsert({
    where: { id: 'br_1' },
    update: {},
    create: {
      id: 'br_1',
      organizationId: orgA.id,
      name: 'Shivajinagar Central Dispensary',
      address: 'Shop 102, Near Bus Stand, Shivajinagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411005',
      phone: '+91 98230 11223',
      status: 'ACTIVE',
      operatingHours: '08:00 AM - 11:00 PM',
    },
  });

  // Pharmacy A - Branch 2
  const branchA2 = await prisma.branch.upsert({
    where: { id: 'br_2' },
    update: {},
    create: {
      id: 'br_2',
      organizationId: orgA.id,
      name: 'Koregaon Park Branch',
      address: 'Lane 7, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      phone: '+91 98230 44556',
      status: 'ACTIVE',
      operatingHours: '24 Hours Emergency Dispensing',
    },
  });

  // Pharmacy B - Branch 1
  const branchB1 = await prisma.branch.upsert({
    where: { id: 'br_3' },
    update: {},
    create: {
      id: 'br_3',
      organizationId: orgB.id,
      name: 'Deccan Wellness Chemist',
      address: 'J.M. Road, Deccan Gymkhana',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
      phone: '+91 98222 33445',
      status: 'ACTIVE',
      operatingHours: '09:00 AM - 10:00 PM',
    },
  });

  console.log('✅ Branches seeded.');

  // 6. Organization Memberships
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: orgA.id, userId: userOwnerA.id } },
    update: {},
    create: {
      organizationId: orgA.id,
      userId: userOwnerA.id,
      role: 'PHARMACY_OWNER',
      status: 'ACTIVE',
    },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: orgA.id, userId: userPharmacist.id } },
    update: {},
    create: {
      organizationId: orgA.id,
      userId: userPharmacist.id,
      branchId: branchA1.id,
      role: 'PHARMACIST',
      status: 'ACTIVE',
    },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: orgA.id, userId: userCashier.id } },
    update: {},
    create: {
      organizationId: orgA.id,
      userId: userCashier.id,
      branchId: branchA1.id,
      role: 'CASHIER',
      status: 'ACTIVE',
    },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: orgB.id, userId: userOwnerB.id } },
    update: {},
    create: {
      organizationId: orgB.id,
      userId: userOwnerB.id,
      role: 'PHARMACY_OWNER',
      status: 'ACTIVE',
    },
  });

  // 7. Inventory & Batches
  // CRITICAL REQUIREMENT: Include the same medicine in both pharmacies with different stock quantities!
  // Medicine: Dolo 650mg
  // Pharmacy A, Branch 1: 180 units @ Rs 30.00
  const invA1_Dolo = await prisma.inventory.upsert({
    where: { branchId_medicineId: { branchId: branchA1.id, medicineId: medDolo.id } },
    update: {},
    create: {
      id: 'inv_a1_dolo',
      organizationId: orgA.id,
      branchId: branchA1.id,
      medicineId: medDolo.id,
      quantity: 180,
      reorderLevel: 25,
      sellingPrice: 30.0,
      mrp: 32.5,
      status: 'IN_STOCK',
      batches: {
        create: [
          {
            id: 'batch_dolo_a1_1',
            batchNumber: 'BT-DOLO-2026-A1',
            expiryDate: new Date('2027-12-31'),
            quantity: 100,
            purchasePrice: 22.0,
          },
          {
            id: 'batch_dolo_a1_2',
            batchNumber: 'BT-DOLO-2026-A2',
            expiryDate: new Date('2028-06-30'),
            quantity: 80,
            purchasePrice: 22.5,
          },
        ],
      },
    },
  });

  // Pharmacy B, Branch 1: 45 units @ Rs 31.00 (Different stock & price!)
  const invB1_Dolo = await prisma.inventory.upsert({
    where: { branchId_medicineId: { branchId: branchB1.id, medicineId: medDolo.id } },
    update: {},
    create: {
      id: 'inv_b1_dolo',
      organizationId: orgB.id,
      branchId: branchB1.id,
      medicineId: medDolo.id,
      quantity: 45,
      reorderLevel: 20,
      sellingPrice: 31.0,
      mrp: 32.5,
      status: 'IN_STOCK',
      batches: {
        create: [
          {
            id: 'batch_dolo_b1_1',
            batchNumber: 'BT-DOLO-2026-B1',
            expiryDate: new Date('2027-08-31'),
            quantity: 45,
            purchasePrice: 23.0,
          },
        ],
      },
    },
  });

  // Medicine: Azithromycin 500mg at Pharmacy A, Branch 1 (40 units)
  const invA1_Azithro = await prisma.inventory.upsert({
    where: { branchId_medicineId: { branchId: branchA1.id, medicineId: medAzithro.id } },
    update: {},
    create: {
      id: 'inv_a1_azithro',
      organizationId: orgA.id,
      branchId: branchA1.id,
      medicineId: medAzithro.id,
      quantity: 40,
      reorderLevel: 15,
      sellingPrice: 115.0,
      mrp: 125.0,
      status: 'IN_STOCK',
      batches: {
        create: [
          {
            id: 'batch_azithro_a1_1',
            batchNumber: 'BT-AZ-2026-09',
            expiryDate: new Date('2027-05-31'),
            quantity: 40,
            purchasePrice: 85.0,
          },
        ],
      },
    },
  });

  // Medicine: Metformin 500mg at Pharmacy A, Branch 1 (6 units - LOW_STOCK)
  const invA1_Metformin = await prisma.inventory.upsert({
    where: { branchId_medicineId: { branchId: branchA1.id, medicineId: medMetformin.id } },
    update: {},
    create: {
      id: 'inv_a1_metformin',
      organizationId: orgA.id,
      branchId: branchA1.id,
      medicineId: medMetformin.id,
      quantity: 6,
      reorderLevel: 20,
      sellingPrice: 42.0,
      mrp: 46.0,
      status: 'LOW_STOCK',
      batches: {
        create: [
          {
            id: 'batch_met_a1_1',
            batchNumber: 'BT-MET-2026-X1',
            expiryDate: new Date('2026-11-30'),
            quantity: 6,
            purchasePrice: 28.0,
          },
        ],
      },
    },
  });

  console.log('✅ Inventory & Batches seeded with cross-pharmacy stock isolation.');

  // 8. Stock Movements (Traceable audit trail)
  await prisma.stockMovement.create({
    data: {
      organizationId: orgA.id,
      branchId: branchA1.id,
      inventoryId: invA1_Dolo.id,
      movementType: 'PURCHASE',
      quantity: 180,
      referenceType: 'PURCHASE_ORDER',
      referenceId: 'PO-2026-001',
      notes: 'Initial opening stock intake from Micro Labs distributor',
      createdById: userPharmacist.id,
    },
  });

  await prisma.stockMovement.create({
    data: {
      organizationId: orgB.id,
      branchId: branchB1.id,
      inventoryId: invB1_Dolo.id,
      movementType: 'PURCHASE',
      quantity: 45,
      referenceType: 'PURCHASE_ORDER',
      referenceId: 'PO-2026-B01',
      notes: 'Stock intake for Deccan branch opening',
      createdById: userOwnerB.id,
    },
  });

  // 9. Sample Prescription
  const rx1 = await prisma.prescription.upsert({
    where: { id: 'rx_demo_1' },
    update: {},
    create: {
      id: 'rx_demo_1',
      organizationId: orgA.id,
      customerId: userCustomer1.id,
      doctorName: 'Dr. K. V. Rao, MD',
      fileUrl: '/uploads/prescriptions/rx_rajesh_sharma.pdf',
      fileName: 'rx_rajesh_sharma.pdf',
      fileType: 'PDF',
      status: 'APPROVED',
      notes: 'Verified Schedule H antibiotic Rx valid for 5 days treatment.',
      reviewedById: userPharmacist.id,
      reviewedAt: new Date(),
    },
  });

  // 10. Sample Online Customer Order
  const sampleOrder = await prisma.order.upsert({
    where: { orderNumber: 'MB-771249' },
    update: {},
    create: {
      id: 'ord_demo_1',
      orderNumber: 'MB-771249',
      organizationId: orgA.id,
      branchId: branchA1.id,
      customerId: userCustomer1.id,
      orderType: 'ONLINE',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      subtotal: 175.0,
      discount: 10.0,
      deliveryFee: 25.0,
      total: 190.0,
      deliveryAddress: 'Flat 402, Shivajinagar Heights, Pune - 411005',
      prescriptionId: rx1.id,
      items: {
        create: [
          {
            id: 'ord_item_1',
            medicineId: medDolo.id,
            medicineName: 'Paracetamol 650mg (Dolo)',
            quantity: 2,
            unitPrice: 30.0,
            total: 60.0,
            prescriptionRequired: false,
          },
          {
            id: 'ord_item_2',
            medicineId: medAzithro.id,
            medicineName: 'Azithromycin 500mg (Azithral)',
            quantity: 1,
            unitPrice: 115.0,
            total: 115.0,
            prescriptionRequired: true,
          },
        ],
      },
      payment: {
        create: {
          id: 'pay_demo_1',
          amount: 190.0,
          currency: 'INR',
          method: 'UPI',
          status: 'PAID',
          transactionRef: 'UPI-RAZORPAY-8849128',
          gatewayName: 'Razorpay UPI',
          paidAt: new Date(),
        },
      },
      delivery: {
        create: {
          id: 'del_demo_1',
          branchId: branchA1.id,
          deliveryStaffId: userDelivery.id,
          deliveryAddress: 'Flat 402, Shivajinagar Heights, Pune - 411005',
          status: 'ASSIGNED',
        },
      },
    },
  });

  // 11. Sample Counter POS Sale
  await prisma.pOSSale.upsert({
    where: { receiptNumber: 'REC-884192' },
    update: {},
    create: {
      id: 'pos_demo_1',
      organizationId: orgA.id,
      branchId: branchA1.id,
      receiptNumber: 'REC-884192',
      customerName: 'Anand Verma',
      customerPhone: '+91 98200 12345',
      subtotal: 60.0,
      discount: 5.0,
      total: 55.0,
      paymentMethod: 'CASH',
      createdById: userCashier.id,
      items: {
        create: [
          {
            id: 'pos_item_1',
            medicineId: medDolo.id,
            medicineName: 'Paracetamol 650mg (Dolo)',
            batchNumber: 'BT-DOLO-2026-A1',
            quantity: 2,
            unitPrice: 30.0,
            total: 60.0,
          },
        ],
      },
      payment: {
        create: {
          id: 'pay_pos_1',
          amount: 55.0,
          currency: 'INR',
          method: 'CASH',
          status: 'PAID',
          paidAt: new Date(),
        },
      },
    },
  });

  // 12. Notifications & Audit Logs
  await prisma.notification.create({
    data: {
      userId: userCustomer1.id,
      title: 'Order Confirmed',
      message: 'Your order MB-771249 has been confirmed by Shivajinagar Central Dispensary.',
      type: 'SUCCESS',
      read: false,
      linkUrl: '/customer/orders',
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: orgA.id,
      branchId: branchA1.id,
      userId: userPharmacist.id,
      action: 'PRESCRIPTION_APPROVED',
      entityType: 'Prescription',
      entityId: rx1.id,
      details: { doctor: 'Dr. K. V. Rao', patient: 'Rajesh Sharma' },
    },
  });

  console.log('✅ Sample Orders, POS Sales, Prescriptions, and Audit Logs seeded.');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
