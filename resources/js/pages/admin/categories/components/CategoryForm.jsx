import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';

export default function CategoryForm({ data, setData, errors, processing, onSubmit, isEdit = false, onCancel }) {
    return (
        <form onSubmit={onSubmit}>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Nama Kategori</Label>
                    <Input
                        type="text"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                        name="description"
                        value={data.description}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('description', e.target.value)}
                        rows={4}
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value)} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status} className="mt-2" />
                </div>

                <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        {isEdit ? 'Update' : 'Simpan'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
