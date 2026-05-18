import { TestBed } from '@angular/core/testing';
import { AddressService } from './address.service';
import { CarouselService } from './carousel.service';
import { ChatbotService, botReply } from './chatbot.service';
import { ContactService } from './contact.service';
import { ToastService } from './toast.service';

describe('local/mock services', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('ToastService adds and dismisses toasts', () => {
    jest.useFakeTimers();
    const t = TestBed.inject(ToastService);
    t.success('ok');
    t.error('boom');
    t.info('fyi', 0);
    let count = 0;
    t.toasts$.subscribe((arr) => (count = arr.length));
    expect(count).toBe(3);
    jest.runAllTimers();
    t.toasts$.subscribe((arr) => (count = arr.length));
    expect(count).toBeLessThan(3);
    jest.useRealTimers();
  });

  it('CarouselService CRUD + move + reset', () => {
    const c = TestBed.inject(CarouselService);
    const initial = c.slides().length;
    c.add({ title: 't', subtitle: 's', cta: 'c', href: '/', bg: 'bg' });
    expect(c.slides().length).toBe(initial + 1);
    const id = c.slides()[c.slides().length - 1].id;
    c.update(id, { title: 'updated' });
    expect(c.slides().find((s) => s.id === id)?.title).toBe('updated');
    c.move(c.slides().length - 1, -1);
    c.remove(id);
    expect(c.slides().find((s) => s.id === id)).toBeUndefined();
    c.setFixedText('hello');
    expect(c.fixedText()).toBe('hello');
    c.reset();
    expect(c.slides().length).toBe(initial);
  });

  it('ChatbotService conversation lifecycle + botReply', () => {
    const cb = TestBed.inject(ChatbotService);
    const id = cb.startConversation('a@b.c');
    cb.addMessage(id, { role: 'user', text: 'prix ?', at: 'now' });
    cb.escalate(id);
    expect(cb.conversations()[0].escalated).toBe(true);
    cb.remove(id);
    expect(cb.conversations().length).toBe(0);
    expect(botReply('quel prix')).toContain('tarifs');
    expect(botReply('SOC')).toContain('SOC');
    expect(botReply('edr')).toContain('EDR');
    expect(botReply('xdr')).toContain('XDR');
    expect(botReply('parler à un humain')).toContain('agent');
    expect(botReply('merci')).toContain('plaisir');
    expect(botReply('???')).toContain('contact');
  });

  it('ContactService send / handled / remove', () => {
    const cs = TestBed.inject(ContactService);
    const m = cs.send('a@b.c', 'Sujet', 'Message');
    expect(cs.messages().length).toBe(1);
    cs.setHandled(m.id, true);
    expect(cs.messages()[0].handled).toBe(true);
    cs.remove(m.id);
    expect(cs.messages().length).toBe(0);
  });

  it('AddressService addresses + masked payment methods', () => {
    const a = TestBed.inject(AddressService);
    const addr = a.addAddress({
      firstName: 'J',
      lastName: 'D',
      line1: 'x',
      city: 'c',
      region: 'r',
      zip: 'z',
      country: 'F',
      phone: '0',
    });
    a.updateAddress(addr.id, { city: 'Paris' });
    expect(a.addresses()[0].city).toBe('Paris');
    a.removeAddress(addr.id);
    expect(a.addresses().length).toBe(0);

    const m = a.addMethod({ cardNumber: '4242424242424242', holder: 'J D', expiry: '12/27' });
    expect(m.last4).toBe('4242');
    expect(m.isDefault).toBe(true);
    a.addMethod({ cardNumber: '1111222233334444', holder: 'X', expiry: '01/28' });
    a.setDefaultMethod(a.methods()[1].id);
    expect(a.methods()[1].isDefault).toBe(true);
    a.removeMethod(m.id);
    expect(a.methods().length).toBe(1);
  });
});
