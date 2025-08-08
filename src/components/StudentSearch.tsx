import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, User, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Student {
  codigo_aluno: number;
  aluno: string;
  nome_responsavel: string;
  whatsapp_fin: string;
  CPF_resp_fin: string;
  cpf_pai: string | null;
  cpf_mae: string | null;
  telefone_pai: string | null;
  telefone_mae: string | null;
  nome_pai: string | null;
  nome_mae: string | null;
  email_pai: string | null;
  email_mae: string | null;
  selectedParent?: 'pai' | 'mae';
}

interface StudentSearchProps {
  selectedStudents: Student[];
  onStudentSelect: (student: Student) => void;
  onStudentRemove: (codigoAluno: number) => void;
  onParentSelect: (codigoAluno: number, parentType: 'pai' | 'mae') => void;
}

export const StudentSearch = ({ selectedStudents, onStudentSelect, onStudentRemove, onParentSelect }: StudentSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchStudents = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('alunosIntegraSae')
        .select('*')
        .ilike('aluno', `%${term}%`)
        .limit(10);

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Erro na busca",
          description: "Não foi possível buscar os alunos.",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        setSearchResults([]);
        return;
      }

      const filteredResults = data.filter(student => 
        !selectedStudents.some(selected => selected.codigo_aluno === student.codigo_aluno)
      );

      // Mapear os dados do banco para nossa interface Student
      const mappedResults: Student[] = filteredResults.map((item: any) => ({
        codigo_aluno: item.codigo_aluno,
        aluno: item.aluno,
        nome_responsavel: item.nome_responsavel,
        whatsapp_fin: item.whatsapp_fin,
        CPF_resp_fin: item.CPF_resp_fin,
        cpf_pai: item.cpf_pai || null,
        cpf_mae: item.cpf_mae || null,
        telefone_pai: item.telefone_pai || null,
        telefone_mae: item.telefone_mae || null,
        nome_pai: item.nome_pai || null,
        nome_mae: item.nome_mae || null,
        email_pai: item.email_pai || null,
        email_mae: item.email_mae || null
      }));

      setSearchResults(mappedResults);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro na busca",
        description: "Erro inesperado ao buscar alunos.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchStudents(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedStudents]);

  const handleStudentSelect = (student: Student) => {
    onStudentSelect(student);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar aluno pelo nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        
        {searchResults.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 shadow-lg">
            <CardContent className="p-0">
              {searchResults.map((student) => (
                <button
                  key={student.codigo_aluno}
                  onClick={() => handleStudentSelect(student)}
                  className="w-full p-3 text-left hover:bg-accent transition-colors border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{student.aluno}</p>
                      <p className="text-xs text-muted-foreground">
                        Responsável: {student.nome_responsavel} • WhatsApp: {student.whatsapp_fin}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedStudents.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Alunos Selecionados ({selectedStudents.length}):</p>
          <div className="space-y-3">
            {selectedStudents.map((student) => (
              <div key={student.codigo_aluno} className="p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{student.aluno}</span>
                  </div>
                  <button
                    onClick={() => onStudentRemove(student.codigo_aluno)}
                    className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {!student.selectedParent ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Users className="h-4 w-4" />
                      <span>Selecione o responsável:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Pai */}
                      <button
                        onClick={() => onParentSelect(student.codigo_aluno, 'pai')}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors text-left"
                        disabled={!student.nome_pai && !student.cpf_pai}
                      >
                        <div className="text-sm font-medium mb-1">👨 Pai</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Nome: {student.nome_pai || 'Não informado'}</div>
                          <div>CPF: {student.cpf_pai || 'Não informado'}</div>
                          <div>Tel: {student.telefone_pai || 'Não informado'}</div>
                        </div>
                      </button>
                      
                      {/* Mãe */}
                      <button
                        onClick={() => onParentSelect(student.codigo_aluno, 'mae')}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors text-left"
                        disabled={!student.nome_mae && !student.cpf_mae}
                      >
                        <div className="text-sm font-medium mb-1">👩 Mãe</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Nome: {student.nome_mae || 'Não informado'}</div>
                          <div>CPF: {student.cpf_mae || 'Não informado'}</div>
                          <div>Tel: {student.telefone_mae || 'Não informado'}</div>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      Responsável selecionado: {student.selectedParent === 'pai' ? '👨 Pai' : '👩 Mãe'}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Nome: {student.selectedParent === 'pai' ? student.nome_pai : student.nome_mae}</div>
                      <div>CPF: {student.selectedParent === 'pai' ? student.cpf_pai : student.cpf_mae}</div>
                      <div>Tel: {student.selectedParent === 'pai' ? student.telefone_pai : student.telefone_mae}</div>
                    </div>
                    <button
                      onClick={() => onParentSelect(student.codigo_aluno, student.selectedParent === 'pai' ? 'mae' : 'pai')}
                      className="text-xs text-primary hover:underline mt-2"
                    >
                      Trocar para {student.selectedParent === 'pai' ? 'Mãe' : 'Pai'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};