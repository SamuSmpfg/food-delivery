import { Router } from 'express';
import { clerkClient } from '@clerk/express';
import ChefApplication from '../models/chefApplicationModel.js';

const router = Router();

function requireAdminKey(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  const received = req.header('x-admin-key');

  if (!expected || received !== expected) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
}

function clerkErrorMessage(err, fallback) {
  return err?.errors?.[0]?.longMessage ?? fallback;
}

router.post('/chef-invitations', requireAdminKey, async (req, res) => {
  const { email } = req.body ?? {};

  if (!email) {
    return res.status(400).json({ message: 'email é obrigatório' });
  }

  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.CHEF_INVITE_REDIRECT_URL,
      publicMetadata: { role: 'chef' },
      notify: true,
    });

    return res.status(201).json({
      id: invitation.id,
      email: invitation.emailAddress,
      status: invitation.status,
    });
  } catch (err) {
    console.error('Erro ao criar convite:', err);
    return res
      .status(400)
      .json({ message: clerkErrorMessage(err, 'Não foi possível criar o convite') });
  }
});

router.get('/chef-applications', requireAdminKey, async (req, res) => {
  const { status = 'pending' } = req.query;
  const filter = ['pending', 'approved', 'rejected'].includes(status) ? { status } : {};

  try {
    const applications = await ChefApplication.find(filter).sort({ createdAt: -1 });
    return res.json(applications);
  } catch (err) {
    console.error('Erro ao listar candidaturas:', err);
    return res.status(500).json({ message: 'Não foi possível listar as candidaturas' });
  }
});

router.post('/chef-applications/:id/approve', requireAdminKey, async (req, res) => {
  try {
    const application = await ChefApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Candidatura não encontrada' });
    }

    if (application.status === 'approved') {
      return res.status(409).json({ message: 'Candidatura já aprovada' });
    }

    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: application.email,
      redirectUrl: process.env.CHEF_INVITE_REDIRECT_URL,
      publicMetadata: { role: 'chef' },
      notify: true,
    });

    application.status = 'approved';
    application.invitationId = invitation.id;
    application.reviewedAt = new Date();
    await application.save();

    return res.json({
      id: application._id,
      email: application.email,
      status: application.status,
      invitationId: invitation.id,
    });
  } catch (err) {
    console.error('Erro ao aprovar candidatura:', err);
    return res
      .status(400)
      .json({ message: clerkErrorMessage(err, 'Não foi possível aprovar a candidatura') });
  }
});

// POST /api/admin/chef-applications/:id/reject
router.post('/chef-applications/:id/reject', requireAdminKey, async (req, res) => {
  try {
    const application = await ChefApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Candidatura não encontrada' });
    }

    if (application.status === 'approved') {
      return res.status(409).json({ message: 'Candidatura já aprovada' });
    }

    application.status = 'rejected';
    application.reviewedAt = new Date();
    await application.save();

    return res.json({ id: application._id, status: application.status });
  } catch (err) {
    console.error('Erro ao rejeitar candidatura:', err);
    return res.status(500).json({ message: 'Não foi possível rejeitar a candidatura' });
  }
});

export default router;