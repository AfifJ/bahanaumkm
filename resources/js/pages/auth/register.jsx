import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role_id: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Buat akun baru" description="Masukkan detail Anda di bawah untuk membuat akun">
            <Head title="Daftar" />
            <form method="POST" className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Nama lengkap"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role_id">Peran</Label>
                        <Select
                            id="role_id"
                            required
                            tabIndex={2}
                            value={data.role_id}
                            onValueChange={(value) => setData('role_id', value)}
                            disabled={processing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih peran" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Admin</SelectItem>
                                <SelectItem value="2">Vendor</SelectItem>
                                <SelectItem value="3">Mitra</SelectItem>
                                <SelectItem value="4">Sales Lapangan</SelectItem>
                                <SelectItem value="5">Buyer</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role_id} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Kata Sandi</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Kata sandi"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Konfirmasi kata sandi"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Buat Akun
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Sudah punya akun?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Masuk
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
