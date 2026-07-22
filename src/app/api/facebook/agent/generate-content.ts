/**
 * Facebook Content Generation Pipeline
 * Generates product showcase content and educational posts
 * Can be called by agent or manually
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      connectorId,
      contentType = 'PRODUCT_SHOWCASE', // PRODUCT_SHOWCASE | EDUCATIONAL | UPDATE | PROMOTIONAL
      productIds = [],
      numberOfPosts = 3,
      scheduleStartTime = new Date(),
      scheduleIntervalHours = 24
    } = body;

    if (!workspaceId || !connectorId) {
      return NextResponse.json(
        { error: 'Missing workspaceId or connectorId' },
        { status: 400 }
      );
    }

    const generatedPosts = [];

    for (let i = 0; i < numberOfPosts; i++) {
      try {
        const post = await generatePost({
          workspaceId,
          connectorId,
          contentType,
          productIds,
          scheduleTime: new Date(
            scheduleStartTime.getTime() + i * scheduleIntervalHours * 60 * 60 * 1000
          )
        });

        if (post) {
          generatedPosts.push(post);
        }
      } catch (error) {
        console.error(`Error generating post ${i + 1}:`, error);
      }
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: `Generated ${generatedPosts.length} posts`,
      postsGenerated: generatedPosts.length,
      posts: generatedPosts
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function generatePost(options: {
  workspaceId: string;
  connectorId: string;
  contentType: string;
  productIds: string[];
  scheduleTime: Date;
}) {
  const {
    workspaceId,
    connectorId,
    contentType,
    productIds,
    scheduleTime
  } = options;

  // Generate content based on type
  let caption = '';
  let hashtags = [];
  let destinationUrl = '';

  switch (contentType) {
    case 'PRODUCT_SHOWCASE':
      const showcase = generateProductShowcase(productIds);
      caption = showcase.caption;
      hashtags = showcase.hashtags;
      destinationUrl = showcase.url;
      break;

    case 'EDUCATIONAL':
      const educational = generateEducationalContent();
      caption = educational.caption;
      hashtags = educational.hashtags;
      break;

    case 'UPDATE':
      const update = generateUpdateContent();
      caption = update.caption;
      hashtags = update.hashtags;
      break;

    case 'PROMOTIONAL':
      const promo = generatePromotionalContent();
      caption = promo.caption;
      hashtags = promo.hashtags;
      destinationUrl = promo.url;
      break;

    default:
      return null;
  }

  // Create content item
  const { data: contentItem, error: contentError } = await supabase
    .from('facebook_content_items')
    .insert({
      workspace_id: workspaceId,
      connector_id: connectorId,
      status: 'DRAFT',
      content_type: contentType,
      scheduled_publish_time: scheduleTime,
      created_by: 'system@agent'
    })
    .select()
    .single();

  if (contentError || !contentItem) {
    throw new Error('Failed to create content item');
  }

  // Create content version
  const { data: version, error: versionError } = await supabase
    .from('facebook_content_versions')
    .insert({
      content_item_id: contentItem.id,
      version_number: 1,
      caption,
      hashtags,
      destination_url: destinationUrl,
      status: 'DRAFT',
      created_by: 'system@agent'
    })
    .select()
    .single();

  if (versionError || !version) {
    throw new Error('Failed to create content version');
  }

  // Log audit event
  await supabase.from('facebook_audit_logs').insert({
    workspace_id: workspaceId,
    action_type: 'CONTENT_GENERATED',
    resource_type: 'CONTENT_ITEM',
    resource_id: contentItem.id,
    actor_email: 'system@agent',
    details: {
      contentType,
      scheduledTime: scheduleTime,
      productIds
    }
  });

  return {
    id: contentItem.id,
    status: contentItem.status,
    type: contentType,
    caption,
    hashtags,
    scheduledTime: scheduleTime,
    versionId: version.id
  };
}

function generateProductShowcase(productIds: string[]) {
  const showcases = [
    {
      caption: '🎯 Introducing Our Latest Cybersecurity Solution!\n\nProtect your business with enterprise-grade security. Advanced threat detection, real-time monitoring, and 24/7 support.\n\n✅ Zero-trust architecture\n✅ AI-powered threat detection\n✅ Compliance ready\n\nLearn more about how we can secure your infrastructure.',
      hashtags: ['#Cybersecurity', '#Security', '#Enterprise', '#Protection', '#ThreatDetection'],
      url: 'https://example.com/products'
    },
    {
      caption: '🛡️ Security Breach? We\'ve Got You Covered!\n\nOur incident response team is available 24/7 to help you respond to security threats.\n\n⚡ Rapid response\n⚡ Expert analysis\n⚡ Comprehensive reporting\n\nDon\'t let security incidents slow you down.',
      hashtags: ['#IncidentResponse', '#Security', '#Cybersecurity', '#Protection', '#Enterprise'],
      url: 'https://example.com/services'
    },
    {
      caption: '💡 Did You Know? Most breaches happen due to weak passwords.\n\nImplement strong authentication with our multi-factor authentication solution.\n\n🔐 Biometric support\n🔐 Hardware tokens\n🔐 FIDO2 certified\n\nSecure your accounts today!',
      hashtags: ['#Authentication', '#Security', '#MFA', '#Cybersecurity', '#BestPractices'],
      url: 'https://example.com/mfa'
    }
  ];

  return showcases[Math.floor(Math.random() * showcases.length)];
}

function generateEducationalContent() {
  const educational = [
    {
      caption: '🎓 Security Tip: Enable Two-Factor Authentication\n\nTwo-factor authentication (2FA) adds an extra layer of security to your accounts. Even if someone gets your password, they can\'t access your account without the second factor.\n\n📱 Use an authenticator app\n📱 Receive SMS codes\n📱 Use hardware keys\n\nWhich method do you prefer?',
      hashtags: ['#SecurityTip', '#2FA', '#Cybersecurity', '#BestPractices', '#Protection']
    },
    {
      caption: '🔍 Understanding Phishing Attacks\n\nPhishing is a social engineering attack where attackers trick you into revealing sensitive information.\n\n⚠️ Look for suspicious sender addresses\n⚠️ Check for urgent language\n⚠️ Hover over links to see the real URL\n⚠️ Never click attachments from unknown senders\n\nStay vigilant!',
      hashtags: ['#Phishing', '#Cybersecurity', '#Awareness', '#Security', '#Protection']
    },
    {
      caption: '🔐 Password Security Best Practices\n\nA strong password is your first line of defense:\n\n✓ At least 12 characters\n✓ Mix of uppercase and lowercase\n✓ Include numbers and symbols\n✓ Avoid common words\n✓ Use a password manager\n✓ Never reuse passwords\n\nHow strong is your password?',
      hashtags: ['#PasswordSecurity', '#Cybersecurity', '#BestPractices', '#Protection', '#Security']
    }
  ];

  return educational[Math.floor(Math.random() * educational.length)];
}

function generateUpdateContent() {
  const updates = [
    {
      caption: '📢 New Feature Alert!\n\nWe\'ve just launched real-time threat intelligence dashboard. Monitor threats as they happen with our new visualization tools.\n\n🎯 Live threat feeds\n🎯 Custom alerts\n🎯 Detailed analytics\n\nUpdate your system today!',
      hashtags: ['#NewFeature', '#Update', '#ThreatIntelligence', '#Security', '#Innovation']
    },
    {
      caption: '✅ Security Patch Released\n\nWe\'ve released an important security update. Please update your systems to the latest version to stay protected.\n\n🔧 Version 3.2.1\n🔧 Critical fixes\n🔧 Performance improvements\n\nUpdate now to stay secure!',
      hashtags: ['#SecurityUpdate', '#Patch', '#Update', '#Security', '#Important']
    },
    {
      caption: '🎉 We\'ve Hit 10,000 Happy Customers!\n\nThank you for trusting us with your security. We\'re committed to protecting your business and will continue innovating.\n\n💪 Stronger security\n💪 Better support\n💪 New features coming soon\n\nJoin our growing community!',
      hashtags: ['#Milestone', '#Community', '#Security', '#Grateful', '#Innovation']
    }
  ];

  return updates[Math.floor(Math.random() * updates.length)];
}

function generatePromotionalContent() {
  const promos = [
    {
      caption: '🎁 Limited Time Offer!\n\nGet 30% off our Enterprise Security Suite this month.\n\n💰 Save thousands on security\n💰 Full feature access\n💰 Premium support included\n\nOffer ends on the 31st. Don\'t miss out!',
      hashtags: ['#Promotion', '#Deal', '#Security', '#Enterprise', '#LimitedTime'],
      url: 'https://example.com/promo'
    },
    {
      caption: '🚀 Free Security Audit!\n\nSchedule your free security audit today. Our experts will assess your infrastructure and provide recommendations.\n\n✅ No obligation\n✅ Comprehensive report\n✅ Expert consultation\n\nBook your audit now!',
      hashtags: ['#FreeAudit', '#Security', '#Consultation', '#Enterprise', '#Protection'],
      url: 'https://example.com/audit'
    }
  ];

  return promos[Math.floor(Math.random() * promos.length)];
}
