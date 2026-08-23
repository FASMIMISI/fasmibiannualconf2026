/**
 * Unit tests for FormStateManager class
 * Feature: enhanced-registration-system
 */

import { FormStateManager } from '../js/FormStateManager.js';

describe('FormStateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new FormStateManager();
  });

  describe('constructor', () => {
    test('initializes with correct state structure', () => {
      const state = manager.getState();
      
      expect(state).toHaveProperty('personalInfo');
      expect(state).toHaveProperty('categoryInfo');
      expect(state).toHaveProperty('payment');
      expect(state).toHaveProperty('metadata');
      
      expect(state.personalInfo).toEqual({
        fullName: '',
        email: '',
        organization: '',
        designation: '',
        country: '',
        phone: ''
      });
      
      expect(state.categoryInfo).toEqual({
        attendeeCategory: '',
        cohort: '',
        isMember: null,
        verificationFile: null,
        verificationFileBase64: null
      });
      
      expect(state.payment).toEqual({
        calculatedFee: 0,
        transactionId: null,
        paymentStatus: 'pending',
        receiptData: null
      });
      
      expect(state.metadata).toEqual({
        submissionTimestamp: null,
        currentStep: 1
      });
    });
  });

  describe('getState', () => {
    test('returns complete state object', () => {
      const state = manager.getState();
      
      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
      expect(state).toHaveProperty('personalInfo');
      expect(state).toHaveProperty('categoryInfo');
      expect(state).toHaveProperty('payment');
      expect(state).toHaveProperty('metadata');
    });

    test('returns a deep copy of state (prevents external mutations)', () => {
      const state1 = manager.getState();
      state1.personalInfo.fullName = 'Modified';
      
      const state2 = manager.getState();
      expect(state2.personalInfo.fullName).toBe('');
    });
  });

  describe('updateField', () => {
    test('updates top-level nested field using dot notation', () => {
      manager.updateField('personalInfo.fullName', 'John Doe');
      expect(manager.getField('personalInfo.fullName')).toBe('John Doe');
    });

    test('updates email field', () => {
      manager.updateField('personalInfo.email', 'john@example.com');
      expect(manager.getField('personalInfo.email')).toBe('john@example.com');
    });

    test('updates organization field', () => {
      manager.updateField('personalInfo.organization', 'ACME Corp');
      expect(manager.getField('personalInfo.organization')).toBe('ACME Corp');
    });

    test('updates attendee category', () => {
      manager.updateField('categoryInfo.attendeeCategory', 'student');
      expect(manager.getField('categoryInfo.attendeeCategory')).toBe('student');
    });

    test('updates cohort', () => {
      manager.updateField('categoryInfo.cohort', 'india');
      expect(manager.getField('categoryInfo.cohort')).toBe('india');
    });

    test('updates isMember boolean', () => {
      manager.updateField('categoryInfo.isMember', true);
      expect(manager.getField('categoryInfo.isMember')).toBe(true);
    });

    test('updates calculated fee', () => {
      manager.updateField('payment.calculatedFee', 5000);
      expect(manager.getField('payment.calculatedFee')).toBe(5000);
    });

    test('updates transaction ID', () => {
      manager.updateField('payment.transactionId', 'TXN123456');
      expect(manager.getField('payment.transactionId')).toBe('TXN123456');
    });

    test('updates payment status', () => {
      manager.updateField('payment.paymentStatus', 'success');
      expect(manager.getField('payment.paymentStatus')).toBe('success');
    });

    test('updates current step', () => {
      manager.updateField('metadata.currentStep', 2);
      expect(manager.getField('metadata.currentStep')).toBe(2);
    });

    test('throws error for invalid field path', () => {
      expect(() => {
        manager.updateField('invalidSection.field', 'value');
      }).toThrow('Invalid field path: invalidSection.field');
    });

    test('throws error for non-existent nested field', () => {
      expect(() => {
        manager.updateField('personalInfo.nonExistentField', 'value');
      }).toThrow('Invalid field path: personalInfo.nonExistentField');
    });

    test('allows null values', () => {
      manager.updateField('categoryInfo.verificationFile', null);
      expect(manager.getField('categoryInfo.verificationFile')).toBe(null);
    });

    test('allows empty string values', () => {
      manager.updateField('personalInfo.fullName', '');
      expect(manager.getField('personalInfo.fullName')).toBe('');
    });
  });

  describe('getField', () => {
    test('retrieves nested field value', () => {
      manager.updateField('personalInfo.fullName', 'Jane Smith');
      expect(manager.getField('personalInfo.fullName')).toBe('Jane Smith');
    });

    test('retrieves section object', () => {
      const personalInfo = manager.getField('personalInfo');
      expect(personalInfo).toBeDefined();
      expect(typeof personalInfo).toBe('object');
      expect(personalInfo).toHaveProperty('fullName');
    });

    test('throws error for invalid field path', () => {
      expect(() => {
        manager.getField('invalidSection.field');
      }).toThrow('Invalid field path: invalidSection.field');
    });

    test('retrieves boolean values correctly', () => {
      manager.updateField('categoryInfo.isMember', false);
      expect(manager.getField('categoryInfo.isMember')).toBe(false);
    });

    test('retrieves null values correctly', () => {
      expect(manager.getField('categoryInfo.verificationFile')).toBe(null);
    });

    test('retrieves numeric values correctly', () => {
      manager.updateField('payment.calculatedFee', 3500);
      expect(manager.getField('payment.calculatedFee')).toBe(3500);
    });
  });

  describe('reset', () => {
    test('resets all fields to initial state', () => {
      // Modify state
      manager.updateField('personalInfo.fullName', 'John Doe');
      manager.updateField('personalInfo.email', 'john@example.com');
      manager.updateField('categoryInfo.attendeeCategory', 'student');
      manager.updateField('categoryInfo.cohort', 'india');
      manager.updateField('categoryInfo.isMember', true);
      manager.updateField('payment.calculatedFee', 5000);
      manager.updateField('payment.transactionId', 'TXN123');
      manager.updateField('payment.paymentStatus', 'success');
      manager.updateField('metadata.currentStep', 3);
      
      // Reset
      manager.reset();
      
      // Verify all fields are reset
      const state = manager.getState();
      expect(state.personalInfo.fullName).toBe('');
      expect(state.personalInfo.email).toBe('');
      expect(state.categoryInfo.attendeeCategory).toBe('');
      expect(state.categoryInfo.cohort).toBe('');
      expect(state.categoryInfo.isMember).toBe(null);
      expect(state.payment.calculatedFee).toBe(0);
      expect(state.payment.transactionId).toBe(null);
      expect(state.payment.paymentStatus).toBe('pending');
      expect(state.metadata.currentStep).toBe(1);
    });

    test('reset creates fresh state object', () => {
      manager.updateField('personalInfo.fullName', 'Test User');
      const stateBefore = manager.getState();
      
      manager.reset();
      const stateAfter = manager.getState();
      
      expect(stateAfter.personalInfo.fullName).not.toBe(stateBefore.personalInfo.fullName);
      expect(stateAfter.personalInfo.fullName).toBe('');
    });
  });

  describe('isStepComplete', () => {
    describe('Step 1: Personal Information', () => {
      test('returns false when all fields are empty', () => {
        expect(manager.isStepComplete(1)).toBe(false);
      });

      test('returns false when only some fields are filled', () => {
        manager.updateField('personalInfo.fullName', 'John Doe');
        manager.updateField('personalInfo.email', 'john@example.com');
        expect(manager.isStepComplete(1)).toBe(false);
      });

      test('returns true when all fields are filled', () => {
        manager.updateField('personalInfo.fullName', 'John Doe');
        manager.updateField('personalInfo.email', 'john@example.com');
        manager.updateField('personalInfo.organization', 'ACME Corp');
        manager.updateField('personalInfo.designation', 'Engineer');
        manager.updateField('personalInfo.country', 'India');
        manager.updateField('personalInfo.phone', '+91-9876543210');
        
        expect(manager.isStepComplete(1)).toBe(true);
      });

      test('returns false when fields contain only whitespace', () => {
        manager.updateField('personalInfo.fullName', '   ');
        manager.updateField('personalInfo.email', '   ');
        manager.updateField('personalInfo.organization', '   ');
        manager.updateField('personalInfo.designation', '   ');
        manager.updateField('personalInfo.country', '   ');
        manager.updateField('personalInfo.phone', '   ');
        
        expect(manager.isStepComplete(1)).toBe(false);
      });

      test('returns false when one field is missing', () => {
        manager.updateField('personalInfo.fullName', 'John Doe');
        manager.updateField('personalInfo.email', 'john@example.com');
        manager.updateField('personalInfo.organization', 'ACME Corp');
        manager.updateField('personalInfo.designation', 'Engineer');
        manager.updateField('personalInfo.country', 'India');
        // phone is missing
        
        expect(manager.isStepComplete(1)).toBe(false);
      });
    });

    describe('Step 2: Category Selection', () => {
      test('returns false when no fields are selected', () => {
        expect(manager.isStepComplete(2)).toBe(false);
      });

      test('returns false when only category is selected', () => {
        manager.updateField('categoryInfo.attendeeCategory', 'student');
        expect(manager.isStepComplete(2)).toBe(false);
      });

      test('returns false when category and cohort are selected but not member status', () => {
        manager.updateField('categoryInfo.attendeeCategory', 'student');
        manager.updateField('categoryInfo.cohort', 'india');
        expect(manager.isStepComplete(2)).toBe(false);
      });

      test('returns true when all fields are selected for non-India cohort', () => {
        manager.updateField('categoryInfo.attendeeCategory', 'student');
        manager.updateField('categoryInfo.cohort', 'asian');
        manager.updateField('categoryInfo.isMember', true);
        
        expect(manager.isStepComplete(2)).toBe(true);
      });

      test('returns true when all fields are selected for India non-member', () => {
        manager.updateField('categoryInfo.attendeeCategory', 'academic');
        manager.updateField('categoryInfo.cohort', 'india');
        manager.updateField('categoryInfo.isMember', false);
        
        expect(manager.isStepComplete(2)).toBe(true);
      });

      test('returns false when India member without verification file', () => {
        manager.updateField('categoryInfo.attendeeCategory', 'student');
        manager.updateField('categoryInfo.cohort', 'india');
        manager.updateField('categoryInfo.isMember', true);
        // verificationFile is null
        
        expect(manager.isStepComplete(2)).toBe(false);
      });

      test('returns true when India member with verification file', () => {
        manager.updateField('categoryInfo.attendeeCategory', 'student');
        manager.updateField('categoryInfo.cohort', 'india');
        manager.updateField('categoryInfo.isMember', true);
        manager.updateField('categoryInfo.verificationFile', { name: 'id.pdf', size: 1024 });
        
        expect(manager.isStepComplete(2)).toBe(true);
      });

      test('returns true for world cohort member without verification file', () => {
        manager.updateField('categoryInfo.attendeeCategory', 'industry');
        manager.updateField('categoryInfo.cohort', 'world');
        manager.updateField('categoryInfo.isMember', true);
        
        expect(manager.isStepComplete(2)).toBe(true);
      });
    });

    describe('Step 3: Payment', () => {
      test('returns false when payment status is pending', () => {
        expect(manager.isStepComplete(3)).toBe(false);
      });

      test('returns false when payment status is failed', () => {
        manager.updateField('payment.paymentStatus', 'failed');
        expect(manager.isStepComplete(3)).toBe(false);
      });

      test('returns false when payment status is success but no transaction ID', () => {
        manager.updateField('payment.paymentStatus', 'success');
        expect(manager.isStepComplete(3)).toBe(false);
      });

      test('returns true when payment status is success and transaction ID exists', () => {
        manager.updateField('payment.paymentStatus', 'success');
        manager.updateField('payment.transactionId', 'TXN123456789');
        
        expect(manager.isStepComplete(3)).toBe(true);
      });
    });

    describe('Invalid step numbers', () => {
      test('throws error for step 0', () => {
        expect(() => {
          manager.isStepComplete(0);
        }).toThrow('Invalid step number: 0. Must be 1, 2, or 3.');
      });

      test('throws error for step 4', () => {
        expect(() => {
          manager.isStepComplete(4);
        }).toThrow('Invalid step number: 4. Must be 1, 2, or 3.');
      });

      test('throws error for negative step', () => {
        expect(() => {
          manager.isStepComplete(-1);
        }).toThrow('Invalid step number: -1. Must be 1, 2, or 3.');
      });
    });
  });

  describe('Edge cases and integration scenarios', () => {
    test('handles rapid field updates', () => {
      manager.updateField('personalInfo.fullName', 'Name 1');
      manager.updateField('personalInfo.fullName', 'Name 2');
      manager.updateField('personalInfo.fullName', 'Name 3');
      
      expect(manager.getField('personalInfo.fullName')).toBe('Name 3');
    });

    test('preserves independent field values', () => {
      manager.updateField('personalInfo.fullName', 'John Doe');
      manager.updateField('personalInfo.email', 'john@example.com');
      manager.updateField('categoryInfo.cohort', 'india');
      
      expect(manager.getField('personalInfo.fullName')).toBe('John Doe');
      expect(manager.getField('personalInfo.email')).toBe('john@example.com');
      expect(manager.getField('categoryInfo.cohort')).toBe('india');
    });

    test('handles complete registration flow', () => {
      // Fill Step 1
      manager.updateField('personalInfo.fullName', 'Alice Johnson');
      manager.updateField('personalInfo.email', 'alice@example.com');
      manager.updateField('personalInfo.organization', 'Tech University');
      manager.updateField('personalInfo.designation', 'Professor');
      manager.updateField('personalInfo.country', 'Singapore');
      manager.updateField('personalInfo.phone', '+65-98765432');
      
      expect(manager.isStepComplete(1)).toBe(true);
      
      // Fill Step 2
      manager.updateField('categoryInfo.attendeeCategory', 'academic');
      manager.updateField('categoryInfo.cohort', 'asian');
      manager.updateField('categoryInfo.isMember', true);
      
      expect(manager.isStepComplete(2)).toBe(true);
      
      // Fill Step 3
      manager.updateField('payment.calculatedFee', 7000);
      manager.updateField('payment.paymentStatus', 'success');
      manager.updateField('payment.transactionId', 'PAY-ASIA-001');
      
      expect(manager.isStepComplete(3)).toBe(true);
      
      // Verify complete state
      const finalState = manager.getState();
      expect(finalState.personalInfo.fullName).toBe('Alice Johnson');
      expect(finalState.categoryInfo.attendeeCategory).toBe('academic');
      expect(finalState.payment.transactionId).toBe('PAY-ASIA-001');
    });

    test('handles state recovery scenario', () => {
      // Simulate user filling form
      manager.updateField('personalInfo.fullName', 'Bob Smith');
      manager.updateField('personalInfo.email', 'bob@example.com');
      
      // Get state (simulate saving to localStorage)
      const savedState = manager.getState();
      
      // Reset manager (simulate page reload)
      manager.reset();
      
      // Restore state
      manager.updateField('personalInfo.fullName', savedState.personalInfo.fullName);
      manager.updateField('personalInfo.email', savedState.personalInfo.email);
      
      expect(manager.getField('personalInfo.fullName')).toBe('Bob Smith');
      expect(manager.getField('personalInfo.email')).toBe('bob@example.com');
    });
  });
});
