import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Student {
  codigo_aluno: number;
  aluno: string;
  nome_responsavel: string;
  whatsapp_fin: string;
  CPF_resp_fin: string;
}

interface StudentSearchProps {
  selectedStudents: Student[];
  onStudentSelect: (student: Student) => void;
  onStudentRemove: (codigoAluno: number) => void;
}

export const StudentSearch = ({ selectedStudents, onStudentSelect, onStudentRemove }: StudentSearchProps) => {
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
        .select('codigo_aluno, aluno, nome_responsavel, whatsapp_fin, CPF_resp_fin')
        .ilike('aluno', `%${term}%`)
        .limit(10);

      if (error) {
        toast({
          title: "Erro na busca",
          description: "Não foi possível buscar os alunos.",
          variant: "destructive",
        });
        return;
      }

      const filteredResults = data?.filter(student => 
        !selectedStudents.some(selected => selected.codigo_aluno === student.codigo_aluno)
      ) || [];

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
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
        <div className="space-y-2">
          <p className="text-sm font-medium">Alunos Selecionados ({selectedStudents.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedStudents.map((student) => (
              <Badge
                key={student.codigo_aluno}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                <span className="text-xs">
                  {student.aluno} - {student.nome_responsavel}
                </span>
                <button
                  onClick={() => onStudentRemove(student.codigo_aluno)}
                  className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};