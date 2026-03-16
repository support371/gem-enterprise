import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  User,
  Mail,
  Building2,
  Globe,
  CheckCircle2,
  Shield,
  Edit,
} from 'lucide-react'

const profileInfo = [
  { icon: User, label: 'Full Name', value: 'Valued Client' },
  { icon: Mail, label: 'Email Address', value: 'client@example.com' },
  { icon: Building2, label: 'Entity Type', value: 'Individual Investor' },
  { icon: Globe, label: 'Country of Residence', value: 'United States' },
]

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Your <span className="text-gradient-primary">Profile</span>
        </h1>
        <p className="text-slate-400 mt-1">View and manage your account information.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Profile info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Avatar + identity */}
          <Card className="bg-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-2xl font-bold">VC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-white">Valued Client</p>
                  <p className="text-sm text-slate-400">client@example.com</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> KYC Verified
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    <Shield className="w-3 h-3 mr-1" /> Accredited
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile details */}
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileInfo.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm text-white font-medium mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Accredited Investor</p>
                  <p className="text-sm font-medium text-white mt-0.5">Yes</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">KYC Status</p>
                  <p className="text-sm font-medium text-white mt-0.5">Fully Verified</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-400">Member Since</p>
                <p className="text-sm font-medium text-white mt-0.5">January 10, 2026</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Edit form areas */}
        <div className="lg:col-span-3 space-y-6">
          {/* Update personal info */}
          <Card className="bg-card border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-cyan-400" />
                  Update Profile
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">First Name</Label>
                    <Input
                      defaultValue="Valued"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Last Name</Label>
                    <Input
                      defaultValue="Client"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Email Address</Label>
                  <Input
                    type="email"
                    defaultValue="client@example.com"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Entity information */}
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Entity Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Entity Type</Label>
                    <Input
                      defaultValue="Individual Investor"
                      className="bg-white/5 border-white/10 text-white"
                      readOnly
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Country</Label>
                    <Input
                      defaultValue="United States"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div className="glass-panel rounded-lg p-4">
                  <p className="text-xs text-slate-400">
                    To change your entity type or legal name, please submit a service request or
                    contact your dedicated advisor. Identity changes require re-verification.
                  </p>
                </div>
                <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                  Request Entity Change
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
